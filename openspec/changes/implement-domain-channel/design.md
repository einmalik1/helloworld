## Context

`channel` DDL, Zod schemas, Nest DTOs, and Drizzle table TS already exist from generators / Wave A. `#40` shipped Nest boot + Problem Details filter. `#43` must implement Channel CRUD on platform + API without reopening ADRs 0001–0006. In-force ADRs: 0001 (migrations), 0002 (HTTP contract), 0003 (Better Auth), 0004 (platform facade), 0005–0007 (worker/search — out of scope).

## Goals / Non-Goals

**Goals:**

- Platform Channel use-cases (`create` / `get` / `list` / `update` / `delete`) as the shared in-process seam for API (and later MCP).
- Thin Nest `ChannelModule` mapping Results → HTTP per API README.
- Persistence via `DatabaseService` channel query methods (conventions checklist); platform stays Nest-free.
- Duplicate slug → `ValidationError` → 400 Problem Details.
- Smoke covering create→list and duplicate-slug mapping (mocked DB/auth OK).

**Non-Goals:**

- `schema.sql` / migration changes (table already migrated).
- Orval client regen as merge gate; MCP tools; search/graph sync; auth UX (#41).
- Shared generic CRUD framework for all Wave B resources (keep Channel-local; siblings can copy).
- New durable ADR (no facade revisits).

## Decisions

1. **Port + use-cases in platform (no Nest, no modules import)**  
   - Define a small `ChannelRepository` interface in `@helloworld/platform` (insert/findById/list/update/delete/findBySlug as needed).  
   - Use-cases take the port + input, return `Result<T, NotFound | ValidationError | DatabaseError>` via **neverthrow**.  
   - **Why not** Drizzle inside platform: avoids `platform → modules` dependency cycle when modules later wraps platform; schema stays in modules.  
   - **Why not** queries only in Nest service: ADR 0004 requires API/MCP share platform use-cases.

2. **Drizzle queries on `DatabaseService`**  
   - Hand-written channel methods using generated `channel` table.  
   - Nest `ChannelService` adapts `DatabaseService` → `ChannelRepository` and delegates to platform.  
   - Map Postgres unique_violation (`23505`) on slug to `ValidationError` at the adapter or use-case boundary (code-based, not message sniffing).

3. **HTTP surface**  
   - Paths `/channel`, `/channel/:id` per CRUD contract.  
   - Pagination query `page`/`limit` (defaults 1/20, max 100).  
   - Auth: existing global Better Auth guard (no `@Public()` on Channel). Smoke overrides guard / DB as needed.  
   - Controller throws typed errors (or `HttpException` from Result) so the global filter emits Problem Details — do not invent a second error envelope.

4. **Verification**  
   - Platform unit/smoke for use-case Result behaviour with an in-memory fake repository.  
   - Extend `api` smoke (or add `channel.smoke.spec.ts` included in package `smoke`) for Nest wiring + duplicate-slug → 400 without Coolify.

## Risks / Trade-offs

- **[Risk] Wave B siblings invent divergent CRUD shapes** → Mitigation: mirror this design in person/greeting/reaction tickets; extract shared helpers only if duplication hurts later.
- **[Risk] Auth blocks HTTP smoke** → Mitigation: override `AuthGuard` in tests; do not weaken production routes.
- **[Risk] FK restrict on greeting blocks delete** → Mitigation: return `DatabaseError` / typed failure on FK violation for now; cascading delete is out of scope.
- **[Trade-off] Repository port vs drizzle-in-platform** → Prefer port to keep package graph clean.

## Migration Plan

1. Land platform + modules queries + Nest module on automation branch; PR merge.
2. No SQL migration. Rollback = revert feature module + platform channel exports.

## Open Questions

- None blocking. Duplicate slug stays **400** `ValidationError` (status map has no 409); matches domain-channel “conflict/validation” wording and ADR 0002.
