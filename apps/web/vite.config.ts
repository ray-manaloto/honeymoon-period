import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: { "/v1": "http://127.0.0.1:8788" },
  },
  build: {
    target: "es2023",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            /node_modules\/(?:react|react-dom|scheduler|react-router|@remix-run\/router)\//.test(id)
          ) {
            return "react-runtime";
          }
          if (id.includes("/node_modules/@mui/") || id.includes("/node_modules/@emotion/")) {
            return "mui";
          }
          if (
            id.includes("/node_modules/react-admin/") ||
            /node_modules\/ra-[^/]+\//.test(id) ||
            id.includes("/node_modules/@tanstack/") ||
            id.includes("/node_modules/react-hook-form/")
          ) {
            return "react-admin";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    css: true,
    include: ["test/**/*.test.{ts,tsx}"],
    exclude: ["dist/**"],
  },
});
