/**
 * Side-effect import: must run before AppModule so ConfigModule resolves root `.env`.
 * Import this first from `main.ts`, `openapi-export.ts`, and smoke tests.
 */
import { chdirRepoRoot } from "./chdir-repo-root.js";

chdirRepoRoot();
