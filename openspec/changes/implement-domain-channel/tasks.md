## 1. Platform Channel use-cases

- [x] 1.1 Add `neverthrow` (tech-stack pin) to `@helloworld/platform`; export Channel repository port + create/get/list/update/delete use-cases returning `Result` with `NotFound` / `ValidationError` / `DatabaseError`
- [x] 1.2 Add platform unit/smoke covering create→list and duplicate-slug → `ValidationError` with an in-memory fake repository; wire package `test`/`smoke` as needed
- [x] 1.3 Update `packages/platform/README.md` layout to document Channel use-cases (still Nest-free; adapters behind facade)

## 2. Persistence + Nest API

- [x] 2.1 Add hand-written `DatabaseService` channel query methods (insert/findById/list/update/delete) using generated Drizzle `channel` table; map Postgres `23505` unique violations for slug to a signal the adapter turns into `ValidationError`
- [x] 2.2 Implement `apps/api/src/channel` module/controller/service: adapt `DatabaseService` → platform port, map Results to HTTP (`201` create, list envelope, `204` delete, typed errors for filter); import `ChannelModule` in `AppModule`
- [x] 2.3 Add `@helloworld/platform` workspace dependency on `api`; ensure build order / imports resolve from `dist/`

## 3. Verification

- [x] 3.1 Extend api smoke (or `channel.smoke.spec.ts` included in `smoke`) for Channel create→list and duplicate-slug → 400 Problem Details with AuthGuard/DB overrides (no Coolify required)
- [x] 3.2 Run typecheck + build + smoke for `@helloworld/platform`, `@helloworld/modules`, and `api`; fix until green
