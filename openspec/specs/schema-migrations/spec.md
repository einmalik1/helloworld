# schema-migrations Specification

## Purpose
Defines how the Hello World data model moves from authoritative DDL to running Postgres: ownership, migration runner, and coexistence with auth tables — without runtime DDL.

## Requirements

### Requirement: schema.sql remains DDL source of truth
Domain table definitions MUST be authored in `openspec/data-model/schema.sql`. Generated artifacts and ORM schemas MUST derive from that file (or an explicitly documented pipeline fed by it), and silent drift between SQL and runtime schema is forbidden.

#### Scenario: Domain table change starts in SQL
- **WHEN** a developer adds or alters a domain table
- **THEN** the change is made in `openspec/data-model/schema.sql` before application code relies on the new shape

### Requirement: Migrations via drizzle-kit, not runtime DDL
Schema changes MUST be applied with a migration runner (`drizzle-kit migrate` or equivalent documented command). Applications MUST NOT create or alter tables in `onModuleInit()` or similar boot hooks.

#### Scenario: Boot does not CREATE TABLE
- **WHEN** `apps/api` or `apps/worker` starts against an empty database without migrations applied
- **THEN** the process MUST NOT silently create domain tables via runtime DDL; migration must be an explicit step

### Requirement: Drizzle schema ownership documented
The repository MUST document whether Drizzle TypeScript schema is generated from `schema.sql`, hand-maintained under `packages/modules`, or pulled from a migrated database — and MUST keep that choice consistent for domain tables.

#### Scenario: Modules README states ownership
- **WHEN** a developer reads the database section of `packages/modules/README.md` after this baseline is applied
- **THEN** schema ownership and the migrate command intent are stated (no “TBD”)

### Requirement: Better Auth tables coexist under the same migrate path
Better Auth persistence tables MUST be included in the same migration strategy (generated into Drizzle and migrated), not applied via ad-hoc runtime DDL.

#### Scenario: Auth tables not created at request time
- **WHEN** Better Auth is enabled
- **THEN** its tables are expected to exist from migrations before serving auth traffic
