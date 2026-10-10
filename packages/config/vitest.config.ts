import { defineConfig } from "vitest/config";

/**
 * Shared Vitest base for workspace packages.
 * Nest apps/packages that need decorator metadata can extend and add SWC later.
 */
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.{test,spec}.ts", "tests/**/*.{test,spec}.ts"],
  },
});
