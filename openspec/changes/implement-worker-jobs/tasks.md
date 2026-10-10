## 1. Data model + migrate

- [x] 1.1 Hand-author `job` + `outbox` Drizzle tables in `packages/modules/src/database/job-schema.ts`; export from `schema-entry.ts`; note in modules README + nicht-crud katalog
- [x] 1.2 Create migration via `pnpm db:generate` (no `schema.sql` / nest_dto churn)
- [x] 1.3 Typecheck/build `@helloworld/modules` with new schema exports

## 2. Nest worker scaffold

- [x] 2.1 Add `apps/worker/package.json` (name `worker`), tsconfig/vitest, Nest deps + `@nestjs/schedule` 12.0.2, workspace deps on modules/types
- [x] 2.2 Implement `configuration.ts`, `app.module.ts` (config → auth → database → health → logger → ScheduleModule → JobsModule), and `main.ts` (Helmet, request-id, shutdown hooks, Zod pipe, filter, `mountBetterAuth`, listen on WORKER_HOST/PORT — no OpenAPI)
- [x] 2.3 Document `WORKER_HOST` / `WORKER_PORT` in root `.env.example` and update `apps/worker/README.md` scaffolding status

## 3. Jobs feature

- [x] 3.1 Implement JobsModule: repository over Drizzle `job`/`outbox`, `OutboxDrainJob` `@Interval` (honour `WORKER_CONCURRENCY`), operator `JobsController` (`GET /jobs`, `GET /jobs/:id`, `POST /jobs/:id/retry`)
- [x] 3.2 Ensure `/health` remains `@Public()`; job routes require Better Auth session or `x-api-key`

## 4. Verification

- [x] 4.1 Add Nest smoke (Vitest + `@nestjs/testing`, optional supertest) covering AppModule + Schedule wiring and public `/health` without Coolify
- [x] 4.2 Run typecheck + build + smoke for `worker` (and modules if touched); fix until green
