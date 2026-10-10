## Why

Wave A shipped Nest API boot and shared modules, but Greeting has only generated Zod/DTO/Drizzle stubs — no platform use-cases or HTTP CRUD. Wave B needs greeting create/read/list/update/delete so reactions (#45) and later clients can depend on a real resource.

## What Changes

- Add `@helloworld/platform` greeting use-cases (create, get, list with channel filter, PATCH update, delete) returning neverthrow `Result`s.
- Wire Nest `GreetingModule` (controller / thin service / AppModule import) under the shared HTTP contract; use generated DTOs.
- Add persistence helpers that run against Drizzle via injected `DatabaseService.db` (no schema.sql changes).
- Verify with platform/api typecheck + build and package smoke (guard-friendly unit/module coverage for greeting).
- Do **not** re-open ADRs 0001–0006; do **not** implement person/channel/reaction CRUD or auth product UX.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `domain-greeting`: Pin platform + HTTP CRUD wiring (paths, list `channel_id` filter + pagination, FK failure behaviour) on top of the baseline capability already in main specs.

## Impact

- Primary: `packages/platform` (use-cases), `apps/api` (greeting feature module), light deps (`neverthrow`, drizzle schema import).
- Consumes: `@helloworld/modules` `DatabaseService` + greeting table, `@helloworld/types` schemas/errors, existing Nest filter/auth.
- Coordinates with `#45` (reactions reference greeting ids); parallel with `#42`/`#43` (person/channel) — FK parents must exist in DB for create to succeed.
- Unlocks Wave C consumers once Wave B domain tickets land.
