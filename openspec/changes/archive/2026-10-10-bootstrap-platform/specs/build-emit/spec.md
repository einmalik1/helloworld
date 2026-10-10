# Spec Delta

## Purpose

Defines the monorepo emit contract: TypeScript libraries and runnable Node services produce JavaScript under `dist/`, and consumers import built output rather than TypeScript source.

## ADDED Requirements

### Requirement: Library packages emit to dist

Every publishable TypeScript library workspace that is consumed at runtime (`packages/types`, `packages/modules`, `packages/terminal`, `packages/api-client`) MUST define a `build` script that emits JavaScript (and declaration files as configured) into that package’s `dist/` directory.

#### Scenario: Build produces dist for types

- **WHEN** a developer runs `pnpm run --filter @helloworld/types build` from the repo root
- **THEN** the package writes compiled output under `packages/types/dist/`

#### Scenario: Same contract for other emitting libraries

- **WHEN** a developer builds `@helloworld/modules`, `@helloworld/terminal`, or `@helloworld/api-client`
- **THEN** each package writes compiled output under its own `dist/` directory

### Requirement: Package exports point at dist

For emitting library packages, `package.json` `exports` MUST resolve to paths under `dist/` (not `src/*.ts`) so Node and bundlers load built JavaScript.

#### Scenario: Import resolves to built entry

- **WHEN** another workspace imports `@helloworld/types` after that package has been built
- **THEN** the resolved entry is the built file under `dist/`, not a TypeScript file under `src/`

#### Scenario: Temporary src exports are removed

- **WHEN** this change is complete for an emitting library
- **THEN** that library’s public `exports` MUST NOT list `./src/*.ts` entry points

### Requirement: Typecheck remains separate from build

Library and app workspaces that typecheck MUST expose `typecheck` as `tsc --noEmit` (or equivalent). Typecheck MUST NOT be the mechanism that produces the `dist/` artifacts required by consumers.

#### Scenario: Typecheck without prior build

- **WHEN** a developer runs only `pnpm run --filter @helloworld/types typecheck` on valid sources
- **THEN** typecheck can succeed without being responsible for creating consumer-ready `dist/` output

### Requirement: Tooling config package exempt

`@helloworld/config` MUST remain a non-emitting tooling package: its exports MAY stay as JSON/TS config files and it MUST NOT be required to produce a runtime `dist/` for apps.

#### Scenario: Config exports stay as config files

- **WHEN** a workspace extends shared tsconfig or Vitest/Oxlint config from `@helloworld/config`
- **THEN** it consumes the config files exported by that package without a prior `@helloworld/config` build emit
