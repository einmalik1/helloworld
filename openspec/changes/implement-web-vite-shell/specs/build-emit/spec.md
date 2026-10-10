## ADDED Requirements

### Requirement: api-client Orval then tsc emit

`@helloworld/api-client` MUST generate typed clients with Orval into `src/generated/` when `apps/api/openapi.json` is present, then emit JavaScript and declarations to `dist/` via `tsc`. When OpenAPI is missing, `generate` MUST exit 0 without failing the workspace.

#### Scenario: Generate skips without OpenAPI

- **WHEN** `apps/api/openapi.json` is absent and a developer runs `pnpm --filter @helloworld/api-client generate`
- **THEN** the command exits successfully without writing a broken client

#### Scenario: Build emits dist after hand + generated sources

- **WHEN** a developer runs `pnpm --filter @helloworld/api-client build` with valid `src/` sources
- **THEN** the package writes compiled output under `packages/api-client/dist/`

### Requirement: Web Vite emit

`apps/web` MUST emit production assets with `vite build` (Vite out directory). It MUST NOT use Nest `dist/main.js` as its deploy artifact.

#### Scenario: Web build uses Vite

- **WHEN** a developer runs `pnpm --filter @helloworld/web build`
- **THEN** Vite produces the web package’s production output directory
