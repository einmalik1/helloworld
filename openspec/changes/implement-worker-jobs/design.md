## Context

`#40` shipped Nest `apps/api`. `apps/worker` is still README-only. ADR **0007** (supersedes 0005) freezes Nest `@nestjs/schedule` + Postgres work/outbox — not pg-boss. Ticket `#47` must scaffold the worker so `#48` impex and later projection sync can attach jobs.

In-force ADRs: **0001** (no Nest runtime DDL), **0002** (HTTP contract — worker may reuse Problem Details lightly for job errors), **0003** (Better Auth for operator routes), **0004** (S3 — not required until impex), **0006** (outbox drain intent — stub only here), **0007** (schedule, not pg-boss). ADR 0005 is historical only.

## Goals / Non-Goals

**Goals:**

- Bootable Nest worker sharing `@helloworld/modules`, with `ScheduleModule` and at least one interval job (outbox drain stub).
- Postgres `job` (+ `outbox`) tables via `schema.sql` → generate → migrate.
- Operator HTTP: `GET /jobs`, `GET /jobs/:id`, `POST /jobs/:id/retry` behind Better Auth; `GET /health` public.
- Package typecheck/build/smoke without Coolify.

**Non-Goals:**

- Full impex parse/write (#48); AGE/Typesense mutation logic (search ticket).
- OpenAPI on worker; pg-boss; Redis.
- Coolify Application create / Dockerfile unless already present.
- Re-opening ADRs 0001–0007.

## Decisions

1. **Package scaffold** under `apps/worker/` name `worker` (`pnpm --filter worker`):
   - Nest 12 + `@nestjs/schedule` **12.0.2**; workspace deps on `@helloworld/modules` / `@helloworld/types`.
   - Scripts: `dev`, `build`, `typecheck`, `smoke` (mirror api patterns: `tsx` / `tsc`, Vitest + SWC).

2. **AppModule order** (worker README):
   - `createAppConfigModule` → `AuthModule` → `DatabaseModule` → `HealthModule` → `createLoggerModule()` → `ScheduleModule.forRoot()` → `JobsModule`.

3. **Env**: root `.env` only. Schema includes `DATABASE_URL`, Better Auth trio (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN`), `WORKER_HOST` (default `0.0.0.0`), `WORKER_PORT` (default `3001`), `WORKER_CONCURRENCY` (default `1`). Document listen keys in `.env.example`.

4. **Bootstrap**: Helmet, request-id, shutdown hooks, global Zod pipe + Problem Details filter (reuse api pattern or thin copy), `mountBetterAuth` — **no** `setupOpenApi`.

5. **Data model**: hand-author `job` + `outbox` in `packages/modules/src/database/job-schema.ts` (like auth — not `schema.sql`, avoids Nest DTO/API stubs); export from `schema-entry`; `pnpm db:generate` migration. JobsModule uses Drizzle via `DatabaseService` — no runtime DDL.

6. **Schedule jobs**:
   - `OutboxDrainJob` — `@Interval` (e.g. 5s); claim pending outbox rows up to `WORKER_CONCURRENCY`; mark processed or leave no-op when empty (no AGE/Typesense calls yet).
   - Optional `RebuildProjectionJob` cron stub that creates a `job` row in `queued`/`skipped` without talking to search engines.

7. **Operator HTTP** in `JobsController`:
   - List/get from `job` table; retry sets failed → queued (or re-inserts work) idempotently enough for v1.
   - Auth via global `AuthGuard` (not `@Public()`).

8. **Smoke**: Vitest + `@nestjs/testing` (+ supertest) boots AppModule with test env, asserts Schedule providers registered and `/health` public; mock DB ping if needed. Gate: `pnpm --filter worker typecheck && build && smoke`.

## Risks / Trade-offs

- **[Risk] Smoke needs Postgres** → Mitigation: override `DatabaseService.ping` / health indicator; job repository can use mocked provider in unit smoke.
- **[Risk] Schema generate churn** → Mitigation: small additive tables; run generate once; keep out of CRUD API generators if catalog excludes them (no Nest DTO stage for job if generator would create api CRUD — exclude via generator config or nicht-crud).
- **[Trade-off] Stub drain vs real projection** → Stub is enough for `#47`; `#48`/search fill handlers.
- **[Trade-off] Copy filter from api vs share package** → Thin copy under `apps/worker/src/common` to avoid scope creep into modules; share later if needed.

## Migration Plan

1. Land DDL + migration + worker scaffold on automation branch; PR merge.
2. Coolify test worker app can deploy later (shipper); local `pnpm --filter worker dev` for developers.
3. Rollback: revert worker package + drop migration / tables if needed.

## Open Questions

- None blocking. ADR 0007 remains the job-model SoT.
