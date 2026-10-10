## Why

Wave A booted Nest `apps/api` and shared modules, but Channel has only generated Zod/DTOs — no platform use-cases or HTTP CRUD. Wave B needs Channel create/list/get/patch/delete so greetings can target a surface and MCP/API share one in-process path.

## What Changes

- Add Channel use-cases on `@helloworld/platform` (create, get, list, update, delete) returning `neverthrow` Results with typed errors.
- Add Drizzle query helpers on `DatabaseService` for the `channel` table (persistence only).
- Wire Nest `ChannelModule` (controller / service / module) under `apps/api` that calls platform in-process and maps Results to the HTTP contract (`/channel`, `/channel/:id`).
- Reject duplicate `slug` with a validation/conflict outcome consistent with ADR 0002 (typed error → Problem Details).
- Extend package smoke to cover Channel happy-path / duplicate-slug mapping without requiring Coolify as the gate.
- Do **not** re-open facade ADRs 0001–0006; do not change `schema.sql` (table already exists).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `domain-channel`: Make Channel CRUD via platform + API concrete (persistence already specified; pin Nest/platform wiring and duplicate-slug behaviour as implemented).

## Impact

- Primary: `packages/platform`, `packages/modules` (`DatabaseService` channel queries), `apps/api` (`src/channel/*`, `AppModule`).
- Deps: platform gains `neverthrow` (+ types already); api gains `@helloworld/platform`.
- Parallel Wave B: person/greeting/reaction follow the same pattern; coordinate only if shared helper extraction is needed (keep Channel self-contained).
- Out of scope: Orval client regeneration as a hard gate, MCP tools, search/graph projection, auth product UX (#41), Coolify Application create.
