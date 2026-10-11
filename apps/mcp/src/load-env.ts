import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { chdirRepoRoot } from "./chdir-repo-root.js";

/** Side-effect: chdir to repo root and load root `.env` when present. */
export function loadRootEnv(): void {
  chdirRepoRoot();
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) {
    return;
  }
  process.loadEnvFile(envPath);
}
