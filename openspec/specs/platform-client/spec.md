# platform-client Specification

## Purpose
Defines the in-process platform client: the shared application/use-case facade that API and MCP use to reach domain behaviour and external engines without duplicating adapters.

## Requirements

### Requirement: Platform package exists as emit library
The repository MUST provide a workspace package `@helloworld/platform` that builds with `tsc` to `dist/` and exposes `package.json` `exports` pointing at `dist/` (not `src/`), consistent with the monorepo build/emit contract.

#### Scenario: Build emits dist
- **WHEN** a developer runs `pnpm run --filter @helloworld/platform build` from the repo root
- **THEN** compiled output is written under `packages/platform/dist/`

#### Scenario: Exports resolve to dist
- **WHEN** another workspace imports `@helloworld/platform` after it has been built
- **THEN** the resolved entry is under `dist/`, not a TypeScript path under `src/`

### Requirement: Intended consumers are API and MCP
`@helloworld/platform` MUST be documented and structured for in-process use by `apps/api` and `apps/mcp`. External interactive clients (web, CLI, TUI) MUST NOT be directed to depend on `@helloworld/platform` for product HTTP; they continue to use `@helloworld/api-client`.

#### Scenario: Package README states consumers
- **WHEN** a developer reads `packages/platform/README.md`
- **THEN** it states that primary consumers are `apps/api` and `apps/mcp`, and that web/CLI/TUI use `@helloworld/api-client` instead

#### Scenario: Packages overview includes platform
- **WHEN** a developer reads `packages/README.md`
- **THEN** `@helloworld/platform` appears in the package table with its role relative to `api-client` and `modules`

### Requirement: Boundary excludes HTTP SDK and Nest transport
The platform package MUST NOT own Orval-generated HTTP clients, ky transport configuration, or Nest HTTP controllers/routes. Those remain in `@helloworld/api-client` and the Nest apps respectively. Platform MAY later host use-case functions and engine adapters only.

#### Scenario: No api-client dependency for transport
- **WHEN** `packages/platform/package.json` dependencies are inspected in this change’s scaffold
- **THEN** the package does not depend on `@helloworld/api-client` as its means of talking to the product API

### Requirement: Stable facade for engine substitution
The platform client’s public use-case surface is the intended seam for substituting external engines (Postgres access details, object storage, search, knowledge graph). Callers in API and MCP SHOULD depend on platform use-cases rather than engine SDKs directly once those use-cases exist. This change MAY ship a minimal placeholder surface; it MUST document that engine adapters belong behind that surface.

#### Scenario: README documents adapter seam
- **WHEN** a developer reads the platform package README
- **THEN** it describes that Postgres, S3/Garage, search, and graph adapters belong behind the platform facade, not in CLI/web or duplicated in both API and MCP
