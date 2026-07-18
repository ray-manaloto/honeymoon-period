import { fileURLToPath } from "node:url";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  root: repoRoot,
  plugins: [
    cloudflareTest(async () => ({
      wrangler: { configPath: `${repoRoot}/apps/api/wrangler.jsonc` },
      miniflare: {
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(`${repoRoot}/apps/api/migrations`),
          TEST_SEED_SQL: await readFile(`${repoRoot}/apps/api/fixtures/local-seed.sql`, "utf8"),
        },
      },
    })),
  ],
  test: {
    include: ["apps/api/test/**/*.test.ts"],
    setupFiles: ["./apps/api/test/setup.ts"],
    maxWorkers: 1,
    coverage: {
      provider: "istanbul",
      include: ["apps/api/src/**/*.ts"],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
      reporter: ["text", "json", "json-summary"],
    },
  },
});

import { readFile } from "node:fs/promises";
