## Why

Wave A Nest modules (#39) are wired in `@helloworld/modules`, but `apps/api` still has only README + generated DTO stubs — no Nest boot, HTTP contract filter, or fixed infrastructure routes. Wave B domain/auth tickets need a running API process that imports shared modules and emits RFC 9457 Problem Details.

## What Changes

- Scaffold Nest `apps/api` package: `package.json`, Nest CLI/tsconfig, `main.ts`, `AppModule`, `configuration.ts` (`envSchema`).
- Wire `@helloworld/modules`: config → auth → database → health → logger; mount Better Auth + `setupOpenApi` in bootstrap.
- Implement global HTTP exception filter + request-id middleware per ADR 0002 / API README (Problem Details, status map, `requestId`).
- Apply security/ops baseline: Helmet, CORS from `WEB_ORIGIN`, `enableShutdownHooks()`, `@Public()` fixed routes.
- Add typed domain errors in `@helloworld/types` (`NotFound`, `ValidationError`, `DatabaseError`) for the filter status map.
- Add `openapi:export` and package smoke (typecheck/build + Nest boot or HTTP contract smoke).
- Do **not** implement feature CRUD controllers (Wave B) or re-open ADRs 0001–0006.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `api-http-contract`: Pin Nest bootstrap, global Problem Details filter, request correlation, and fixed infrastructure routes as wired in `apps/api` (baseline was contract-level; make scaffold normative).

## Impact

- Primary: `apps/api` (Nest app scaffold), `packages/types` (error classes), light README/ops checklist updates.
- Consumes: `@helloworld/modules` (config/db/health/auth/openapi/logging).
- Unlocks Wave B: `#41`–`#45` (auth + domain CRUD can import AppModule patterns).
- Does **not** add Coolify Dockerfile (still “not scaffolded yet” unless needed for smoke), feature modules, Orval client generation beyond export script, or host Compose as agent smoke plane.
