import shared from "@helloworld/config/vitest";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  shared,
  defineConfig({
    test: {
      include: ["test/**/*.{test,spec}.ts"],
    },
  }),
);
