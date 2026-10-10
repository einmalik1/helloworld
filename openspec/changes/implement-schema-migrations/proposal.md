## Why

Wave A needs a real path from `openspec/data-model/schema.sql` to applied Postgres schema before Nest modules and domain CRUD can land. ADR 0001 and the `schema-migrations` baseline already chose drizzle-kit + a generator stage + Better Auth–owned auth tables; those pieces are still intent-only in the repo.

## What Changes

- Add a **`drizzle` generator stage** that emits domain Drizzle TypeScript under `packages/modules` from `schema-model.json` (fed by `schema.sql`).
- Wire **drizzle-kit** (`drizzle.config.ts`), a committed **migrations/** directory, and root scripts **`pnpm db:generate`** / **`pnpm db:migrate`** (same migrate surface for local and Coolify pre-deploy).
- Establish the **Better Auth schema path** (`packages/modules/.../auth-schema.ts`) as a separate SoT file included in the same drizzle-kit schema set — document regenerate via `@better-auth/cli`; ship an initial auth schema scaffold suitable for migrate.
- Replace remaining “intent / TBD” language in `packages/modules` README, tech-stack Database section, and generator docs with the wired commands and paths.
- Document Coolify pre-deploy using `pnpm db:migrate` (apps that need DB); no Nest runtime DDL.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `schema-migrations`: Pin concrete ownership paths, generator stage, script names, migrations directory, and Better Auth file coexistence under one drizzle-kit migrate path (requirements were intent-level; make them normative for the wired pipeline).

## Impact

- `spark/generators/` (+ `repo-profile.yaml` `generators.drizzle`), root `package.json` scripts, `packages/modules` schema layout + deps (`drizzle-orm`, `drizzle-kit`, `postgres` as needed for kit), migrations folder, docs (`packages/modules/README.md`, `spark/generators/README.md`, `openspec/tech-stack.md` Database section).
- Unlocks `#39` `implement-nest-modules-core` (DatabaseModule can import generated schema).
- Does **not** implement Nest `DatabaseModule` / Better Auth HTTP wiring (those stay Wave A follow-ons).
- Does **not** re-open ADRs 0001–0006.
