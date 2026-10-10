## ADDED Requirements

### Requirement: Drizzle generator stage emits domain schema under packages/modules
The repository MUST provide a `drizzle` stage in `spark/generators` that reads `schema-model.json` and writes domain Drizzle TypeScript under `packages/modules/src/database/schema/`. Domain table definitions MUST NOT be hand-maintained as the primary source of truth.

#### Scenario: Generate after SQL change
- **WHEN** a developer edits `openspec/data-model/schema.sql` and runs `pnpm generate:drizzle` (or full `pnpm generate` including the drizzle stage)
- **THEN** corresponding table modules appear under `packages/modules/src/database/schema/` and are re-exported from that package’s schema index

### Requirement: Root migrate scripts use drizzle-kit
The repository MUST expose root scripts `pnpm db:generate` (`drizzle-kit generate`) and `pnpm db:migrate` (`drizzle-kit migrate`) driven by a committed `drizzle.config.ts` and a migrations directory under `packages/modules`. Coolify pre-deploy documentation MUST name `pnpm db:migrate` as the shared apply command.

#### Scenario: Migrate script is the apply path
- **WHEN** an operator applies pending migrations locally or on Coolify
- **THEN** they use `pnpm db:migrate` against `DATABASE_URL` and do not rely on Nest boot hooks to create tables

### Requirement: Better Auth schema file is a separate SoT in the same kit config
Better Auth tables MUST live in `packages/modules/src/database/auth-schema.ts` (Better Auth CLI–owned), MUST NOT be merged into `openspec/data-model/schema.sql`, and MUST be included in the same drizzle-kit schema entry set used for `db:generate` / `db:migrate`.

#### Scenario: Auth and domain share one migration runner
- **WHEN** `pnpm db:generate` runs with domain + auth schema files registered
- **THEN** migration SQL covers both domain and auth tables for a single `pnpm db:migrate` apply

## MODIFIED Requirements

### Requirement: Drizzle schema ownership documented
The repository MUST document that domain Drizzle TypeScript is generated from `openspec/data-model/schema.sql` via the `drizzle` generator stage into `packages/modules/src/database/schema/`, that auth tables are Better Auth–owned at `packages/modules/src/database/auth-schema.ts`, and that apply uses `pnpm db:migrate` — with no “TBD” placeholders in the database section of `packages/modules/README.md`.

#### Scenario: Modules README states ownership
- **WHEN** a developer reads the database section of `packages/modules/README.md` after this change is applied
- **THEN** schema ownership paths and the migrate command are stated without “TBD” or “intent-only” language for those facts
