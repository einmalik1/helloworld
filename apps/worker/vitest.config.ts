import { defineConfig, mergeConfig } from "vitest/config";
import swc from "unplugin-swc";

import base from "@helloworld/config/vitest";

export default mergeConfig(
  base,
  defineConfig({
    plugins: [swc.vite()],
    test: {
      include: ["src/**/*.spec.ts"],
    },
  }),
);
