## Why

Wave A shipped Nest API scaffolding and shared modules, but Person has only generated Zod/DTO stubs — no platform use-cases or HTTP CRUD. Wave B needs Person as the first domain resource so greetings/reactions and later clients can depend on a real create/list/get/patch/delete path.

## What Changes

- Add Person use-cases in `@helloworld/platform` (neverthrow Results) with a DB-backed store seam.
- Add hand-written `DatabaseService` Person query methods (queries only; no generic CRUD helper).
- Wire Nest `PersonModule` (controller / service / module) using generated DTOs; import into `AppModule`.
- Expose HTTP CRUD under `/person` per the shared API HTTP contract (201 create, list envelope, PATCH, 204 delete, Problem Details on errors).
- Reject duplicate email with a typed validation outcome (existing status map — no new ADR).
- Package/smoke verification for platform + person HTTP happy path / conflict / not-found without reopening facade ADRs.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `domain-person`: Clarify that Person CRUD is implemented via platform use-cases and Nest `/person` routes matching the shared HTTP contract (list pagination, UUID ids, duplicate-email rejection).

## Impact

- Packages: `@helloworld/platform`, `@helloworld/modules` (`DatabaseService`), `apps/api` (`PersonModule`, `AppModule` deps).
- Deps: platform gains `neverthrow` (+ workspace types; DB access via injected store / modules schema as designed).
- Out of scope: channel/greeting/reaction CRUD, auth product UX (`#41`), Coolify Application create, Orval client regen beyond optional `openapi:export`, ADRs 0001–0006.
