#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { gzipSync } from "node:zlib";

const MAX_CHUNK_BYTES = 500_000;
const MAX_INITIAL_GZIP_BYTES = 260_590;
const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, process.argv[2] ?? "apps/web/dist");

function filesUnder(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function attributes(tag) {
  const result = new Map();
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of tag.matchAll(pattern)) {
    result.set(match[1].toLowerCase(), match[2] ?? match[3] ?? match[4] ?? "");
  }
  return result;
}

function initialReferences(html) {
  const references = new Set();
  for (const match of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const tag = match[0];
    const attrs = attributes(tag);
    if (/^<script\b/i.test(tag) && attrs.get("type") === "module" && attrs.has("src")) {
      references.add(attrs.get("src"));
    }
    if (
      /^<link\b/i.test(tag) &&
      (attrs.get("rel") ?? "").split(/\s+/).includes("modulepreload") &&
      attrs.has("href")
    ) {
      references.add(attrs.get("href"));
    }
  }
  return references;
}

function localAsset(reference) {
  if (!reference || reference.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(reference)) {
    throw new Error(`initial JavaScript reference is not a local asset: ${reference}`);
  }
  const pathname = reference.split(/[?#]/, 1)[0].replace(/^\/+/, "");
  const path = resolve(dist, pathname);
  const withinDist = relative(dist, path);
  if (withinDist === ".." || withinDist.startsWith(`..${sep}`)) {
    throw new Error(`initial JavaScript reference escapes the build directory: ${reference}`);
  }
  return path;
}

try {
  const indexPath = resolve(dist, "index.html");
  const html = readFileSync(indexPath, "utf8");
  const chunks = filesUnder(dist)
    .filter((path) => path.endsWith(".js"))
    .map((path) => ({ path, bytes: statSync(path).size }))
    .sort((left, right) => left.path.localeCompare(right.path));
  if (chunks.length === 0) throw new Error("production build contains no JavaScript chunks");

  const violations = chunks
    .filter((chunk) => chunk.bytes > MAX_CHUNK_BYTES)
    .map(
      (chunk) =>
        `${relative(dist, chunk.path)} is ${chunk.bytes} bytes; limit is ${MAX_CHUNK_BYTES}`,
    );
  const initial = [...initialReferences(html)].map(localAsset);
  if (initial.length === 0) throw new Error("index.html has no initial module JavaScript");
  const initialGzipBytes = initial.reduce(
    (total, path) => total + gzipSync(readFileSync(path)).length,
    0,
  );
  if (initialGzipBytes > MAX_INITIAL_GZIP_BYTES) {
    violations.push(
      `initial JavaScript is ${initialGzipBytes} gzip bytes; limit is ${MAX_INITIAL_GZIP_BYTES}`,
    );
  }
  if (violations.length > 0) throw new Error(violations.join("\n"));

  for (const chunk of chunks) {
    process.stdout.write(`${relative(dist, chunk.path)}: ${chunk.bytes} bytes\n`);
  }
  process.stdout.write(
    `Web bundle budget passed: ${chunks.length} chunks at or below ${MAX_CHUNK_BYTES} bytes; ` +
      `initial JavaScript ${initialGzipBytes}/${MAX_INITIAL_GZIP_BYTES} gzip bytes.\n`,
  );
} catch (error) {
  process.stderr.write(`Web bundle budget failed: ${error.message}\n`);
  process.exitCode = 1;
}
