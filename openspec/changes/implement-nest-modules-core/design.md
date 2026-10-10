## Context

`#38` wired schema generation + drizzle-kit migrate. `packages/modules` currently exports only Drizzle schema entrypoints (`src/index.ts`, `database/schema/*`, `auth-schema.ts`). README documents Nest module contracts as “later”. `apps/api` has README + generated DTO stubs only — full Nest boot is `#40`.

In-force ADRs: **0001** (no Nest runtime DDL; schemas already owned under modules), **0003** (Better Auth hand-written instance + global guard; no static `API_KEY` product model). ADRs 0002/0004–0007 constrain HTTP contract / storage / worker / search — not reopened here; OpenAPI helper documents auth schemes consistent with 0003.

## Goals / Non-Goals

**Goals:**

- Ship Nest infra modules in `@helloworld/modules` per README contracts: config, database, health, auth, openapi, logging helper.
- Pin package deps to tech-stack Nest 12 / Better Auth 1.7.7 / nestjs-zod / nestjs-pino / terminus / swagger / postgres.js versions.
- Verify with `pnpm --filter @helloworld/modules typecheck` + `build` and a Nest DI smoke (TS 7 + `emitDecoratorMetadata`).
- Leave README module sections as wired contracts `#40` can copy.

**Non-Goals:**

- Scaffolding `apps/api` `main.ts` / `AppModule` / HTTP exception filter / feature CRUD (`#40`, domain tickets).
- Wave B auth product UX (issue/revoke keys UI, CLI key store) — `implement-auth-better-auth`.
- Changing `schema.sql`, migrations, or generator stages.
- Re-opening ADRs 0001–0006.
- Host Compose as the agent smoke plane.

## Decisions

1. **Package layout** under `packages/modules/src/`:
   - `config/create-app-config-module.ts` — `createAppConfigModule({ envSchema })` using `@nestjs/config` + Zod parse of `process.env` (fail fast on boot).
   - `database/database.module.ts` + `database.service.ts` — postgres.js client + `drizzle(...)` with domain + auth schema; `onModuleDestroy` ends pool; no migrate/DDL.
   - `health/health.module.ts` + controller — Terminus indicators (process + DB via `DatabaseService`); `@Public()` on controller.
   - `auth/` — Better Auth instance factory (Drizzle adapter, api-key plugin, `trustedOrigins` from `WEB_ORIGIN`), `AuthModule` registering global guard, `@Public()` + reflector metadata, Nest middleware/handler mount helper for Better Auth routes (or documented export for `#40` to mount).
   - `openapi/setup-open-api.ts` — SwaggerModule setup + `cleanupOpenApiDoc`.
   - `logging/create-logger-module.ts` — thin wrapper around `LoggerModule.forRoot` with normative defaults.
   - Root `index.ts` re-exports Nest surfaces + existing schema exports.

2. **Auth scope for this ticket:** implement the Nest-facing wiring contract (instance, global guard, `@Public()`, header `x-api-key`, origins from config). Full product flows (sign-up UI, key lifecycle commands) stay Wave B. Auth HTTP handlers remain Better Auth–owned; Nest mounts them, does not reimplement.

3. **Config ownership:** apps still own `envSchema` (`apps/api/src/configuration.ts` in `#40`). Modules only provide the factory. Shared keys used inside modules (`DATABASE_URL`, `BETTER_AUTH_*`, `WEB_ORIGIN`, `LOG_LEVEL`, `NODE_ENV`) are read via `ConfigService` after validation.

4. **Dependencies:** add Nest peer/runtime deps on `@helloworld/modules` at tech-stack pins (`@nestjs/*` 12.x, `better-auth` / `@better-auth/api-key` 1.7.7, `nestjs-zod` 5.5.0, `nestjs-pino` 5.3.0, `pino` 10.3.1, `postgres` 3.4.9, `@nestjs/terminus` 12.1.0, `@nestjs/swagger` 12.0.2, etc.). Prefer modules owning runtime deps Nest apps will share; avoid duplicating unrelated worker-only packages.

5. **Exports:** keep existing schema subpaths; add main export for Nest modules. Optional subpaths (`./config`, `./database`, …) only if tree-shaking/clarity needs them — default to root barrel for Nest imports.

6. **Verification / smoke:** no workspace `smoke` script yet. Gate = `pnpm --filter @helloworld/modules typecheck && pnpm --filter @helloworld/modules build` plus a Vitest Nest testing-module smoke that constructs Config+Database (mocked or skipped DB if no URL) + Health metadata so decorator metadata works under TS 7. Document in change tasks / modules README.

7. **types/config:** add shared Nest error types only if Auth/Health need them now; otherwise leave `packages/types` as Zod-only until `#40`. Use `@helloworld/config` vitest/SWC only if the DI smoke needs it (pin `unplugin-swc` per tech-stack if introducing Nest Vitest here).

## Risks / Trade-offs

- **[Risk] Better Auth Nest mount details drift from docs** → Mitigation: keep instance + guard in modules; `#40` only calls `setupOpenApi` + mounts auth handler from exported helper; Wave B re-runs `auth generate` if schema drifts.
- **[Risk] Full Nest app not present — health/auth hard to E2E** → Mitigation: package build + DI smoke; HTTP E2E waits for `#40`.
- **[Risk] Heavy Nest deps in modules before api exists** → Mitigation: intentional — unlocks `#40`; versions pinned in tech-stack.
- **[Trade-off] Auth module now vs Wave B** → Ship Nest wiring now (ticket focus); defer product key lifecycle to Wave B.

## Migration Plan

1. Land modules + deps + README + smoke on automation branch; merge via PR.
2. `#40` imports modules in `AppModule` / `main.ts`.
3. Rollback: revert package; no DB migration changes in this ticket.

## Open Questions

- None blocking. ADR 0003 remains in force for auth product choice.
