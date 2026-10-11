import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "../../apps/api/openapi.json",
    output: {
      mode: "tags-split",
      target: "./src/generated/api.ts",
      schemas: "./src/generated/models",
      client: "fetch",
      override: {
        mutator: {
          path: "./src/http.ts",
          name: "customFetch",
        },
      },
    },
  },
});
