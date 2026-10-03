#!/usr/bin/env node
/**
 * Orval client codegen. Skips cleanly until apps/api/openapi.json exists
 * (produced by `pnpm --filter api openapi:export` when Nest is wired).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const openapi = join(root, "../../apps/api/openapi.json");
const config = join(root, "orval.config.ts");

if (!existsSync(openapi)) {
  console.log(
    "api-client: skip generate (missing apps/api/openapi.json — run openapi:export when api is wired)",
  );
  process.exit(0);
}

if (!existsSync(config)) {
  console.log("api-client: skip generate (missing orval.config.ts)");
  process.exit(0);
}

const result = spawnSync(
  "pnpm",
  ["exec", "orval", "--config", "orval.config.ts"],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
);
process.exit(result.status ?? 1);
