import { contractFixtures } from "@honeymoon-period/generated";
import { describe, expect, it } from "vitest";
import contract from "../../../openapi/v1.json";
import { assertContract, ContractError } from "../src/contract";

describe("OpenAPI runtime contract", () => {
  it("accepts a valid stable error envelope", () => {
    expect(() =>
      assertContract("ErrorEnvelope", { error: { code: "invalid_request", message: "Invalid" } }),
    ).not.toThrow();
  });

  it("accepts every generated contract fixture", () => {
    for (const [schema, fixture] of Object.entries(contractFixtures)) {
      expect(() => assertContract(schema as keyof typeof contractFixtures, fixture)).not.toThrow();
    }
  });

  it("documents every error status emitted by each authenticated operation", () => {
    for (const [path, pathItem] of Object.entries(contract.paths)) {
      for (const operation of Object.values(pathItem).filter(
        (value): value is { responses: Record<string, unknown> } =>
          typeof value === "object" && value !== null && "responses" in value,
      )) {
        const requiredErrors = path.includes("{")
          ? ["400", "401", "404", "429", "500"]
          : ["400", "401", "429", "500"];
        for (const status of requiredErrors) {
          expect(operation.responses[status]).toEqual({
            $ref: "#/components/responses/Error",
          });
        }
      }
    }
  });

  it.each([
    ["CaptureInput", {}, "/source_url"],
    [
      "PreferenceChangeInput",
      { vote: "yes", score: 9, client_request_id: "invalid-preference" },
      "/vote",
    ],
    [
      "PreferenceChangeInput",
      { vote: "maybe", score: 3, client_request_id: "", reason: "why" },
      "/client_request_id",
    ],
    ["NoteInput", { body: "" }, "/body"],
    ["HoneymoonPeriodUpdate", { unsupported: true }, "/unsupported"],
  ] as const)("rejects invalid %s payloads", (schema, value, field) => {
    try {
      assertContract(schema, value);
      expect.unreachable("contract should reject invalid payload");
    } catch (error) {
      expect(error).toBeInstanceOf(ContractError);
      expect(Object.keys((error as ContractError).fields).join(" ")).toContain(
        field.replace(/^\//, ""),
      );
    }
  });
});
