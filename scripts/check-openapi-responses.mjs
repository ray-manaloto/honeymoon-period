#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const contractPath = resolve(process.argv[2] ?? "openapi/v1.json");
const contract = JSON.parse(await readFile(contractPath, "utf8"));
const methods = new Set(["get", "post", "put", "patch", "delete"]);
const expectedErrors = new Map([
  ["createCapture", ["400", "401", "429", "500"]],
  ["listHoneymoonPeriods", ["400", "401", "429", "500"]],
  ["getHoneymoonPeriod", ["400", "401", "404", "429", "500"]],
  ["updateHoneymoonPeriod", ["400", "401", "404", "429", "500"]],
  ["createPreferenceChange", ["400", "401", "404", "409", "429", "500"]],
  ["getHoneymoonPeriodHistory", ["400", "401", "404", "429", "500"]],
  ["getHistoricalRanking", ["400", "401", "404", "429", "500"]],
  ["createNote", ["400", "401", "404", "429", "500"]],
  ["updateNote", ["400", "401", "404", "429", "500"]],
]);
const failures = [];
let operationCount = 0;
const operationsById = new Map();

for (const [path, pathItem] of Object.entries(contract.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method) || typeof operation !== "object" || operation === null) continue;
    operationCount += 1;
    const operationLocation = `${method.toUpperCase()} ${path}`;
    const operationId = operation.operationId;
    if (typeof operationId !== "string" || operationId.trim() === "") {
      failures.push(`${operationLocation} has no operationId`);
      continue;
    }
    const existingLocation = operationsById.get(operationId);
    if (existingLocation) {
      failures.push(
        `${existingLocation} and ${operationLocation} have duplicate operationId ${operationId}`,
      );
    } else {
      operationsById.set(operationId, operationLocation);
    }
    const requiredErrors = expectedErrors.get(operationId);
    if (!requiredErrors) {
      failures.push(`${operationLocation} has no declared emitted-error matrix`);
      continue;
    }
    for (const status of requiredErrors) {
      const response = operation.responses?.[status];
      if (response?.$ref !== "#/components/responses/Error") {
        failures.push(`${operationLocation} is missing ${status} Error response`);
      }
    }
  }
}

if (operationCount !== expectedErrors.size) {
  failures.push(
    `contract has ${operationCount} operations but emitted-error matrix has ${expectedErrors.size}`,
  );
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`OpenAPI error response audit passed for ${operationCount} operations.\n`);
}
