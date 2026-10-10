# Proposal

## Why

The monorepo documents a full build/emit and local-dev contract in `spec/tech-stack.md` and the root README, but almost none of it is wired: no `turbo.json`, no shared `@helloworld/config` files, package `exports` still point at `src/`, and root scripts for `dev` / `build` / `lint` / `format` / `docker:local:*` are missing. Later waves (Nest modules, API, domain) cannot land cleanly until this foundation exists.

## What Changes

- Add shared tooling package contents under `packages/config` (`tsconfig.base.json`, Vitest base, Oxlint config) and make workspaces able to extend them.
- Wire Turborepo (`turbo.json`) and root `package.json` scripts for `dev`, `build`, `test`, `lint`, `typecheck`, `format`, and local Compose helpers.
- Flip library packages that emit JS (`types`, `modules`, `terminal`, `api-client`) to the **build/emit contract**: `build` → `dist/`, `exports` → `./dist/…` (not `./src/…`).
- Provide a minimal local data-plane: Compose (or equivalent) under `infra/` for Postgres + S3-compatible stand-in, driven by root `docker:local:up` / `docker:local:down`, aligned with `.env.example`.
- Keep root `.env` as the single runtime config file; document and enforce “no per-app `.env`” in the platform capability (no Nest `envSchema` wiring yet — that belongs with `packages/modules`).

**Out of scope for this change:** Nest application bootstrap, Better Auth, Drizzle schema/migrations, domain CRUD, worker/impex, web bundler choice, Coolify Dockerfiles, MCP/docs/storybook app scaffolds beyond package.json hooks if needed for Turbo filters.

## Capabilities

### New Capabilities

- `monorepo-tooling`: Shared config package, Turbo task graph, and root quality/dev scripts that every workspace uses.
- `build-emit`: TypeScript library/app emit contract — consumers import built `dist/` output; typecheck stays `tsc --noEmit`.
- `local-dev-runtime`: Single root `.env` + local Compose stand-ins for Postgres and object storage so apps can be started from the repo root.

### Modified Capabilities

- (none — OpenSpec main specs are empty; these are initial capabilities)

## Impact

- **Touched:** root `package.json`, new `turbo.json`, `packages/config/*`, `packages/{types,modules,terminal,api-client}/package.json` (+ tsconfigs/build scripts), `infra/postgres` / `infra/s3` Compose wiring, possibly root README pointers once wired.
- **Deps to add (root or config):** `turbo`, `typescript` (workspace), `oxlint`, `oxfmt`, `vitest` as documented in `spec/tech-stack.md`.
- **Does not change:** runtime HTTP APIs, domain schema behaviour, generated ERD/types content.
- **Unlocks:** subsequent changes for Nest modules, schema migrations, and API HTTP contract.
