# monorepo-tooling Specification

## Purpose
Defines how developers and CI drive the Hello World monorepo: shared tooling config, Turbo task graph, and root scripts for quality and development.

## Requirements

### Requirement: Shared tooling config package

The repository MUST expose a workspace package `@helloworld/config` that provides base TypeScript compiler options, a shared Vitest base config, and shared Oxlint rules. Application and library workspaces that compile TypeScript MUST be able to extend these bases instead of duplicating compiler or lint settings.

#### Scenario: Workspace extends shared tsconfig

- **WHEN** a TypeScript workspace configures its `tsconfig.json`
- **THEN** it can extend `@helloworld/config/tsconfig` (or the documented export path) for the common strict ESM / `nodenext` baseline

#### Scenario: Config package has no app emit

- **WHEN** a developer inspects `@helloworld/config`
- **THEN** the package MUST NOT require a `build` step that emits application JavaScript to `dist/`

### Requirement: Root quality and build scripts

The repository root MUST provide runnable scripts `format`, `lint`, `typecheck`, `test`, and `build` that operate across the workspace (via Turborepo or equivalent orchestration). `typecheck` MUST invoke `tsc --noEmit` (or package scripts that do so) and MUST NOT substitute for `build`.

#### Scenario: Quality gate from repo root

- **WHEN** a developer runs `pnpm run format`, `pnpm run lint`, `pnpm run typecheck`, and `pnpm run test` from the repo root after dependencies are installed
- **THEN** each command completes using the shared tooling without requiring per-app cwd

#### Scenario: Typecheck does not emit JS

- **WHEN** `pnpm run typecheck` succeeds for a library package
- **THEN** that package’s `dist/` output is not required to have been produced by typecheck alone

### Requirement: Turbo task graph

The repository MUST define a Turborepo configuration such that `build` depends on upstream workspace builds (`^build`) and records `dist/**` (and documented app-specific outputs) as build outputs. Persistent `dev` tasks MUST NOT be cached and MUST wait on upstream library builds where libraries are consumed.

#### Scenario: Library builds before dependent app

- **WHEN** an app workspace that depends on `@helloworld/types` (or another emitting library) is built via the root `build` task
- **THEN** the library’s `build` runs first and produces its `dist/` before the app build consumes it

#### Scenario: Dev is persistent and uncached

- **WHEN** a developer runs the root `dev` task
- **THEN** Turbo treats `dev` as persistent and does not cache its result
