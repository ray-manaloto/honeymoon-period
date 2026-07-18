#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requested = process.argv.slice(2);
const statusArgs = [
  "status",
  "--porcelain=v1",
  "-z",
  "--no-renames",
  "--untracked-files=all",
  ...(requested.length > 0 ? ["--", ...requested] : []),
];
const raw = execFileSync("git", statusArgs, { cwd: root, encoding: "utf8" });
const statuses = new Map(
  raw
    .split("\0")
    .filter(Boolean)
    .map((entry) => [entry.slice(3), entry.slice(0, 2)]),
);
function repositoryPath(input) {
  const absolute = resolve(root, input);
  const path = relative(root, absolute);
  if (path === ".." || path.startsWith(`..${sep}`)) {
    throw new Error(`path is outside repository: ${input}`);
  }
  return { absolute, path };
}

function expand(input) {
  const { absolute, path } = repositoryPath(input);
  const resolved = realpathSync(absolute);
  const resolvedPath = relative(root, resolved);
  if (resolvedPath === ".." || resolvedPath.startsWith(`..${sep}`)) {
    throw new Error(`path resolves outside repository: ${input}`);
  }
  if (!statSync(resolved).isDirectory()) return [path];
  return readdirSync(resolved, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, resolve(entry.parentPath, entry.name)));
}

const paths = requested.length > 0 ? [...new Set(requested.flatMap(expand))] : [...statuses.keys()];

const entries = paths
  .map((input) => {
    const { absolute, path } = repositoryPath(input);
    const bytes = readFileSync(absolute);
    return {
      path,
      status: statuses.get(path) ?? "  ",
      size: statSync(absolute).size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  })
  .sort((left, right) => left.path.localeCompare(right.path));

const manifest = {
  branch: execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim(),
  head: execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim(),
  entries,
};
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
