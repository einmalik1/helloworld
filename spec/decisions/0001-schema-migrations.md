# 0001 — Schema ownership and migration runner

## Status

Accepted

## Context

Hello World already treats [`spec/erd/schema.sql`](../erd/schema.sql) as the SQL source of truth and drives Zod / Nest DTO codegen through `pnpm generate`. We need a durable path from that SQL into Drizzle TypeScript, applied PostgreSQL migrations, and Better Auth tables — without runtime DDL in Nest lifecycle hooks.

Contested choices: hand-written Drizzle under `packages/modules` vs a generator stage vs `drizzle-kit pull`; where Better Auth tables live relative to `schema.sql`; how local vs Coolify QA/Prod apply migrations.

Issue: [#4](https://github.com/einmalik1/helloworld/issues/4). Spec summary: [`tech-stack.md` § Database / Drizzle](../tech-stack.md#database--drizzle-schema--migrations).

## Decision

1. **Domain schema SoT remains `spec/erd/schema.sql`.** Add a **`drizzle` generator stage** that emits domain Drizzle TypeScript under `packages/modules` (same pipeline family as `types` / `api` / `nest_dto`).
2. **Better Auth tables are owned by Better Auth.** Generate via `@better-auth/cli` into a **separate** Drizzle module file (e.g. `auth-schema.ts`). Do **not** hand-merge auth DDL into `schema.sql` unless ERD documentation for auth is later required as an explicit exception.
3. **Migrations run with `drizzle-kit migrate`** through a root/package script. Coolify **pre-deploy** runs that same script. Local and QA/Prod share one command surface.
4. **No runtime DDL** in Nest `onModuleInit()` (or any app lifecycle) — no `CREATE TABLE IF NOT EXISTS` / idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS` at boot.

## Consequences

- Domain table changes start in SQL, then `pnpm generate` (including the drizzle stage), then migrate — before hand-written `DatabaseService` query methods (process **#6** / [GH #13](https://github.com/einmalik1/helloworld/issues/13)).
- `packages/modules` holds generated domain Drizzle schema + Better Auth schema file + Nest `DatabaseModule` / `DatabaseService`; auth and domain schemas stay distinct files.
- Deploy wiring must invoke the migrate script before traffic; app containers assume the schema is already applied.
- Impl still to wire: drizzle-kit config, migrations directory, package scripts, Coolify pre-deploy, Better Auth CLI output path.

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Hand-written domain Drizzle as primary SoT | Fights the existing SQL-first generators (`schema.sql` → Zod / ERD / Nest DTOs); two competing SoTs |
| `drizzle-kit pull` as primary | Pulls from a live DB bootstrapped from SQL; adds an extra DB round-trip and fights the generator pipeline as the canonical transform |
| Auth tables hand-merged into `schema.sql` | Splits ownership with Better Auth’s CLI; prefer “auth tables = Better Auth owned” unless ERD docs force a documented exception |
| Runtime DDL in Nest lifecycle (prior-project pattern) | No migration history, unsafe for QA/Prod, hard to review; rejected for this template |
| Different migrate commands per environment | Drift risk; one script local + Coolify pre-deploy |
