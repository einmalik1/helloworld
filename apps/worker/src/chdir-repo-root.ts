import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Ensure process.cwd() is the monorepo root so ConfigModule loads root `.env`. */
export function chdirRepoRoot(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  let dir = here;
  for (let i = 0; i < 8; i += 1) {
    if (
      existsSync(resolve(dir, "pnpm-workspace.yaml")) &&
      existsSync(resolve(dir, ".env.example"))
    ) {
      process.chdir(dir);
      return;
    }
    dir = resolve(dir, "..");
  }
}
