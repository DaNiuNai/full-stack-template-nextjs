import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  envPrefix: ["VITE_", "TEST_"],

  test: {
    environment: "node",
    globals: true,
  },

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@generated": fileURLToPath(new URL("./generated", import.meta.url)),
    },
  },
});
