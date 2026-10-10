## Context

`#39` shipped `@helloworld/modules` (config, database, health, auth, openapi, logging). `apps/api` today is README + generated `src/*/dto` only — no `package.json`, `main.ts`, or AppModule. ADR **0002** freezes Problem Details + 400 validation; ADR **0003** freezes Better Auth (no static `API_KEY`). Ticket `#40` must not re-open ADRs 0001–0006.

In-force ADRs reviewed: 0001 (no runtime DDL), 0002 (HTTP contract), 0003 (Better Auth), 0004–0007 (storage/worker/search/schedule — out of scope).

## Goals / Non-Goals

**Goals:**

- Scaffold Nest `apps/api` so it boots, validates root env, wires modules, mounts auth + OpenAPI, and emits Problem Details via a global filter.
- Add hand-authored error classes in `@helloworld/types` for the status map.
- Verify with package typecheck/build + a Nest/HTTP smoke (fixed routes and/or filter contract).
- Leave feature CRUD to Wave B (`#42`–`#45`); leave auth product UX to `#41`.

**Non-Goals:**

- Domain controllers/services for person/channel/greeting/reaction.
- Coolify Application create / Dockerfile (README still marks Dockerfile as later unless smoke requires a minimal one — prefer Nest smoke without Coolify deploy).
- Host `docker:local:up` as the agent smoke plane (Coolify test remains shared plane; local Postgres optional for developers).
- Re-opening facade ADRs; Orval client regeneration beyond providing `openapi:export`.

## Decisions

1. **Package scaffold** under `apps/api/`:
   - `package.json` name `api` (filter `@helloworld/api` or `api` per workspace convention — match README `pnpm --filter api`).
   - Nest 12 deps at tech-stack pins; workspace deps on `@helloworld/modules`, `@helloworld/types`.
   - `nest-cli.json` + `tsconfig` extending `@helloworld/config`; build `nest build` → `dist/`.
   - Scripts: `dev` (`nest start --watch`), `build`, `typecheck`, `smoke`, `openapi:export`.

2. **Bootstrap** follows API README normative `main.ts` / AppModule order:
   - `createAppConfigModule({ envSchema })` → `AuthModule` → `DatabaseModule` → `HealthModule` → `createLoggerModule()`.
   - `mountBetterAuth(app, auth)` + `setupOpenApi` + Helmet + CORS + shutdown hooks + global Zod pipe + global filter.
   - Request-id: middleware that accepts/generates `x-request-id`, sets response header; filter reads it for Problem Details `requestId` (align with nestjs-pino `genReqId` in modules helper).

3. **Exception filter** in `src/common/filters/http-exception.filter.ts`:
   - Map `NotFound` → 404, validation/Zod → 400, `DatabaseError` / unknown → 500.
   - Content-Type `application/problem+json`; stable `type` URIs (document small catalog in filter or README pointer).
   - No string sniffing of `message`.

4. **Error classes** in `packages/types/src/errors.ts` (hand-authored), re-exported from package index — required by ADR 0002 / README status map before feature services exist.

5. **Smoke / verification:**
   - Prefer `pnpm --filter api typecheck && build && smoke`.
   - Smoke: Vitest + `@nestjs/testing` (+ optional supertest) that boots AppModule with test env, overrides DB/auth as needed, asserts Problem Details shape on a thrown typed error and/or that Health/OpenAPI metadata is registered. Full `tests/api` against Coolify is out of scope for this ticket’s gate.
   - If root lacks a `smoke` script, document package-level smoke as the gate (same pattern as `#39`).

6. **OpenAPI export:** small script that creates Nest app (or uses Swagger document factory) and writes `apps/api/openapi.json` for Orval — paths match modules `setupOpenApi` defaults.

7. **Dockerfile:** skip unless required for documented deploy path in this ticket; README already says not scaffolded — Coolify app plane can wait for shipper/later.

## Risks / Trade-offs

- **[Risk] Smoke needs real Postgres** → Mitigation: mock `DatabaseService.ping` / override Health DB indicator in unit smoke; do not require Coolify for green gate.
- **[Risk] Better Auth mount + Nest body parser conflicts** → Mitigation: use exported `mountBetterAuth` as `#39` designed; do not reimplement auth routes.
- **[Risk] Scope creep into domain CRUD** → Mitigation: no feature modules in AppModule beyond infra; generated DTOs stay unused until Wave B.
- **[Trade-off] Error classes in types now vs with first domain ticket** → Ship now — filter cannot map typed errors otherwise; Wave B reuses them.

## Migration Plan

1. Land scaffold + types errors + smoke on automation branch; PR merge to `main`.
2. Wave B tickets import feature modules into existing `AppModule`.
3. Rollback: revert `apps/api` Nest sources / package.json; no SQL migration in this change.

## Open Questions

- None blocking. ADR 0002 remains the HTTP contract SoT; this change implements it.
