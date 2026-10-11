/**
 * Side-effect import: must run before AppModule so ConfigModule resolves root `.env`.
 */
import { chdirRepoRoot } from "./chdir-repo-root.js";

chdirRepoRoot();
