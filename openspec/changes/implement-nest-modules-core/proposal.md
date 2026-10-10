## Why

Wave A schema/migrations (#38) landed domain + auth Drizzle schema and `pnpm db:migrate`. Nest apps still cannot boot shared infra: `packages/modules` only re-exports schema files. `#40` API scaffold needs reusable config/db/health/auth/openapi/logging modules before feature routes.

## What Changes

- Implement Nest infrastructure in `@helloworld/modules`: `createAppConfigModule`, `DatabaseModule`/`DatabaseService`, `HealthModule` (`GET /health` + `@Public()`), Better Auth module (instance + global guard + `@Public()`), `setupOpenApi`, and optional nestjs-pino logger helper matching API README defaults.
- Add Nest/Drizzle/Better Auth/OpenAPI dependencies (versions from tech-stack) and subpath exports as needed.
- Update `packages/modules/README.md` (and light tech-stack cross-links if stale) so module contracts are wired, not “later”.
- Add package-level verification (typecheck/build + Nest DI smoke under TS 7) so `#40` can import modules without inventing them.
- Touch `packages/types` / `packages/config` only if modules need shared Zod helpers or Vitest/SWC config for the DI smoke.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `nest-modules-core`: Pin concrete exports, module contracts, and verification path for config/db/health/auth/openapi/logging (baseline requirements were intent-level; make them normative for the wired package).

## Impact

- `packages/modules` (primary), optionally `packages/types` / `packages/config`, docs under `packages/modules/README.md` (+ tech-stack pointers if needed).
- Unlocks `#40` `implement-api-scaffold` (AppModule can import shared modules).
- Does **not** scaffold `apps/api` HTTP app, feature CRUD, Orval client, or Wave B auth UX (`implement-auth-better-auth`).
- Does **not** re-open facade ADRs 0001–0006.
