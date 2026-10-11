import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRoot, "");
  const port = Number(env.WEB_PORT || process.env.WEB_PORT || 5173);

  return {
    plugins: [react(), tailwindcss()],
    envDir: repoRoot,
    envPrefix: ["PUBLIC_", "VITE_"],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: env.WEB_HOST || "0.0.0.0",
      port,
      strictPort: true,
    },
    preview: {
      host: env.WEB_HOST || "0.0.0.0",
      port,
    },
  };
});
