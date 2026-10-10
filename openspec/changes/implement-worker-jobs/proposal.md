## Why

Wave C needs a Nest `apps/worker` process that owns background work with Nest `@nestjs/schedule` and Postgres-backed job state (ADR 0007). Today `apps/worker` is README-only; impex (#48) and projection sync cannot land without a bootable worker that shares `@helloworld/modules`.

## What Changes

- Scaffold Nest `apps/worker`: package.json, tsconfig, `main.ts`, `AppModule`, `configuration.ts` (`envSchema`).
- Wire `@helloworld/modules` (config → auth → database → health → logger) plus `ScheduleModule.forRoot()` and a job feature module.
- Persist durable job/run rows in PostgreSQL (domain DDL + Drizzle); **no** pg-boss / Redis broker.
- Expose `GET /health` (public) and operator job HTTP: list / status / retry (authenticated).
- Add a scheduled outbox-drain (and optional rebuild placeholder) that updates job/work state without implementing full impex or AGE/Typesense sync (#48 / search ticket).
- Package smoke (typecheck/build + Nest boot / health / schedule wiring) without requiring Coolify for the gate.
- Update worker README / `.env.example` for `WORKER_HOST` / `WORKER_PORT` listen keys.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `worker-jobs`: Pin Nest worker bootstrap, `@nestjs/schedule` trigger model, Postgres job rows, and operator job HTTP as wired in `apps/worker` (replace leftover pg-boss Purpose prose).

## Impact

- Primary: `apps/worker`, `openspec/data-model/schema.sql` (+ generate/migrate for job/outbox tables), light README / `.env.example`.
- Consumes: `@helloworld/modules`, `@nestjs/schedule` 12.0.2.
- Unlocks: `#48` implement-impex (and later projection sync) against a real worker process.
- Does **not** implement impex file processing, AGE/Typesense projection logic, Coolify Dockerfile (unless already required), or re-open ADRs 0001–0007.
