import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Walk up from this file until package.json name helloworld / pnpm-workspace. */
export function chdirRepoRoot(): void {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "pnpm-workspace.yaml")) && existsSync(join(dir, "package.json"))) {
      process.chdir(dir);
      return;
    }
    dir = dirname(dir);
  }
}
