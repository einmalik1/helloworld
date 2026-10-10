## Context

API scaffold (#40) boots Nest with modules (config/auth/db/health/logger) and Problem Details filter. Greeting has generated Zod (`@helloworld/types`), Nest DTOs, and Drizzle table — no use-cases or routes. ADR **0004** requires API → `@helloworld/platform` in-process. Ticket `#44` must not re-open ADRs 0001–0006. Person/channel CRUD land in parallel tickets; FK parents must exist in Postgres for create.

In-force ADRs reviewed: 0001–0007 (facade/storage/worker/search/schedule).

## Goals / Non-Goals

**Goals:**

- Ship greeting CRUD in platform + thin Nest HTTP module per domain-greeting spec and API README HTTP contract.
- List supports `channel_id` filter + `page`/`limit`.
- Gate with typecheck/build + package smoke (existing HTTP contract smoke still green; greeting covered by platform/unit or module test with AuthGuard override).

**Non-Goals:**

- Person/channel/reaction CRUD; auth key product UX (#41).
- schema.sql / migration changes; Orval client regeneration beyond running `openapi:export` if cheap.
- Coolify deploy as agent smoke plane; MCP tools; search/graph projection.
- Re-opening ADRs 0001–0006.

## Decisions

1. **Platform owns use-cases** under `packages/platform/src/greeting/`:
   - `createGreeting`, `getGreeting`, `listGreetings`, `updateGreeting`, `deleteGreeting`.
   - Each takes a Drizzle db handle (from Nest `DatabaseService.db`) + input; returns `Promise<Result<T, E>>` with typed errors from `@helloworld/types`.
   - Import greeting table via `@helloworld/modules/database/schema`; add `drizzle-orm`, `neverthrow`, and workspace modules dep on platform (schema subpath only at call sites).
   - Map Postgres FK violations on create/update to `NotFound` or `ValidationError` (no orphan rows); missing row on get/update/delete → `NotFound`.

2. **Nest thin layer** under `apps/api/src/greeting/`:
   - `greeting.module.ts` / `.controller.ts` / `.service.ts`; import in `AppModule` after infra modules.
   - Service injects `DatabaseService`, delegates to platform; controller maps `Result` → throw typed errors / HTTP codes per README (201 create, 204 delete, list envelope).
   - Hand-written list query DTO: `page`, `limit`, optional `channel_id`.
   - Generated create/update/response DTOs unchanged.
   - Routes require global AuthGuard (not `@Public()`).

3. **No DatabaseService domain methods** for this resource: queries live in platform use-cases (ADR 0004 + nest-modules-core “domain not in modules”). Conventions checklist “DatabaseService methods” is satisfied by using `DatabaseService.db` as the injected handle — keeps modules infra-only.

4. **Deps:** `@helloworld/platform` gains `neverthrow`, `drizzle-orm`, `@helloworld/modules` (schema). `apps/api` gains `@helloworld/platform`.

5. **Verification:** `pnpm --filter @helloworld/platform typecheck && build`; `pnpm --filter api typecheck && build && smoke`. Add focused Vitest for platform list filter / NotFound mapping and/or Nest module test with AuthGuard overridden. Full `tests/api` Coolify E2E out of gate scope.

6. **OpenAPI:** after controller lands, run `openapi:export` so document includes `/greeting` (client regen optional if Orval needs it for this ticket — prefer export at minimum).

## Risks / Trade-offs

- **[Risk] Parallel person/channel not merged — create fails FK in shared env** → Mitigation: document dependency; tests seed person/channel rows via Drizzle or skip live HTTP create in smoke.
- **[Risk] AuthGuard blocks unauthenticated CRUD in smoke** → Mitigation: keep package smoke on public probe; greeting tests override guard or call platform directly.
- **[Trade-off] Queries in platform vs DatabaseService methods** → Prefer platform for ADR 0004 / nest-modules-core alignment; Nest stays thin.
- **[Risk] Circular workspace deps** → Mitigation: platform imports schema subpath only; modules must not import platform.

## Migration Plan

1. Land platform + Nest module + tests on automation branch; PR merge.
2. `#45` reactions consume greeting ids; person/channel tickets supply FK parents for real traffic.
3. Rollback: revert feature module + platform greeting exports; no SQL migration.

## Open Questions

- None blocking. ADR 0004 remains the facade SoT.
