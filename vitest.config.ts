import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["packages/**/*.test.ts", "apps/web/**/*.test.{ts,tsx}"],
    setupFiles: ["./apps/web/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/domain/src/**/*.ts", "apps/web/src/**/*.{ts,tsx}"],
      exclude: ["apps/web/src/main.tsx"],
      thresholds: { lines: 90, branches: 90, functions: 90, statements: 90 },
      reporter: ["text", "json-summary"],
    },
  },
});
