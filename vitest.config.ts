import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  envPrefix: ["VITE_", "TEST_"],

  test: {
    environment: "node",
    globals: true,
    globalSetup: ["./tests/setup.ts"],
    fileParallelism: false,
    hookTimeout: 15_000,
    testTimeout: 15_000,
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@generated": fileURLToPath(new URL("./generated", import.meta.url)),
      "@tests": fileURLToPath(new URL("./tests", import.meta.url)),
    },
  },
});
