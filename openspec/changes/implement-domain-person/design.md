## Context

`#40` shipped Nest `apps/api` boot, Problem Details filter, and generated Person DTOs. `@helloworld/platform` is still a placeholder export. `DatabaseService` exposes only `db` + `ping`. Main spec `domain-person` and feature `person.md` define fields + CRUD acceptance. Ticket `#42` / backlog: platform + API CRUD person; do not re-open ADRs 0001–0006.

In-force ADRs reviewed: **0001** (no runtime DDL), **0002** (Problem Details / status map), **0003** (Better Auth — routes stay behind global guard; this change does not build key UX), **0004** (API/MCP → platform in-process), **0005–0008** (worker/storage/search/chat — out of scope).

## Goals / Non-Goals

**Goals:**

- Implement Person create / get / list / patch / delete in `@helloworld/platform` with neverthrow Results.
- Persist via Drizzle on the existing `person` table (already migrated); hand-written query methods on `DatabaseService`.
- Nest `PersonModule` thin over platform; paths `/person`, `/person/:id` per HTTP contract.
- Smoke covering create→get, duplicate email → 400 Problem Details, missing id → 404 (override auth as needed like existing API smoke).

**Non-Goals:**

- Channel / greeting / reaction CRUD (`#43`–`#45`).
- Auth product flows (`#41`), Orval client regen as a hard gate, Coolify app Dockerfile create.
- New HTTP status classes (no Conflict/409 ADR) — uniqueness → `ValidationError` → 400.
- Schema.sql / migration changes.
- Re-opening facade ADRs 0001–0006.

## Decisions

1. **Layering (ADR 0004 + conventions):**
   - `DatabaseService`: Person query methods only (`insert`, `findById`, `list`, `update`, `delete`) — no Nest HTTP, no Result mapping for HTTP.
   - `@helloworld/platform`: `createPerson` / `getPerson` / `listPersons` / `updatePerson` / `deletePerson` accepting a small `PersonStore` port (implemented by adapting `DatabaseService` in the Nest service, or a thin adapter module). Returns `Result<T, NotFound | ValidationError | DatabaseError>`.
   - Nest `PersonService`: wires store + calls platform; maps `Result` → throw typed errors / `HttpException` for the filter.
   - Nest `PersonController`: DTOs, status codes (`201`/`204`), list query DTO, OpenAPI decorators.

2. **Paths & shapes:** Collection `/person` (singular resource name matching table / generator conventions used elsewhere in DTOs). List query: hand-written Zod/`createZodDto` with `page`/`limit` (max 100). Response list: `{ items, total, page, limit }`.

3. **Duplicate email:** Catch Postgres unique violation (or pre-check) → `ValidationError` with a clear message. Filter already maps to 400 Problem Details.

4. **Empty display_name / invalid body:** Rely on Zod DTOs + global `ZodValidationPipe` for request shape; platform MAY additionally reject empty `display_name` with `ValidationError`.

5. **Auth:** Keep global Better Auth guard; person routes authenticated by default. Smoke overrides the guard (or uses testing module override) so CRUD can be exercised without a live key — same spirit as `#40` probe routes.

6. **Deps:** Add `neverthrow` to `@helloworld/platform`; add `@helloworld/platform` workspace dep on `api`. Platform MUST NOT depend on `@nestjs/*` or `@helloworld/api-client`.

7. **Verification:** `pnpm --filter @helloworld/platform typecheck && build`; `pnpm --filter @helloworld/modules typecheck && build` if DatabaseService touched; `pnpm --filter api typecheck && build && smoke` with person scenarios added (mock/override DB if no Postgres — prefer real DB when `DATABASE_URL` reachable; otherwise unit-level store mock for platform + HTTP mapping with overridden `PersonStore` / `DatabaseService`).

## Risks / Trade-offs

- **[Risk] Smoke needs Postgres** → Mitigation: prefer Coolify/test or local URL when present; otherwise mock `DatabaseService` person methods in Nest testing module for green package smoke; document.
- **[Risk] Unique-violation detection fragile across drivers** → Mitigation: check postgres.js / drizzle error code `23505` and/or message; fall back to `DatabaseError` if unknown.
- **[Trade-off] ValidationError vs Conflict for duplicates** → Choose ValidationError to stay inside ADR 0002 status map without a new ADR.
- **[Trade-off] Store port vs platform importing modules** → Port keeps Nest out of platform and matches ADR 0004 adapter seam.

## Migration Plan

1. Land platform + DatabaseService methods + PersonModule on automation branch; merge via PR.
2. Later Wave B resources copy the same layering pattern.
3. Rollback: revert feature module / platform person exports / DatabaseService methods; no SQL migration in this change.

## Open Questions

- None blocking. Singular `/person` path matches generator/table naming; if OpenAPI later prefers plurals, that would be a separate contract change.
