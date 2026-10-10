# local-dev-runtime Specification

## Purpose
Defines the local development runtime baseline: one repo-root env file and Compose stand-ins for Postgres and S3-compatible object storage started from the monorepo root.

## Requirements

### Requirement: Single root environment file

Runtime configuration for local development MUST live in a single repo-root `.env` file derived from `.env.example`. The repository MUST NOT require or document per-app `.env` files under `apps/`, `tools/`, or `tests/` as the primary configuration source.

#### Scenario: Developer copies example env

- **WHEN** a developer sets up local configuration from the documented template
- **THEN** they create `.env` at the repository root from `.env.example` and edit values there

#### Scenario: No per-app env as primary source

- **WHEN** a developer follows the local development instructions
- **THEN** they are not instructed to create `apps/*/.env` or `tools/*/.env` for standard service configuration

### Requirement: Env example covers shared data plane
`.env.example` MUST document Shared, Postgres (`DATABASE_URL`), object-storage (`S3_*`), and **Typesense (`TYPESENSE_*`)** sections suitable for local Compose stand-ins, plus documented service sections for apps, and a **chat** section (host/port and LLM adapter placeholders such as `CHAT_*` / `CHAT_LLM_*`). AGE MUST be available via the same `DATABASE_URL` against an AGE-enabled local Postgres image (not stock Postgres without the extension when graph features are exercised).

#### Scenario: Postgres URL matches local stand-in intent
- **WHEN** a developer uses the default `DATABASE_URL` from `.env.example` with local Postgres up
- **THEN** the URL targets the local Compose Postgres service (host/port/db/user as documented)

#### Scenario: S3 keys match local stand-in intent
- **WHEN** a developer uses the default `S3_*` values from `.env.example` with local object storage up
- **THEN** those values target the local S3-compatible stand-in endpoint and credentials as documented

#### Scenario: Typesense keys match local stand-in intent
- **WHEN** a developer uses the default `TYPESENSE_*` values with local Typesense up
- **THEN** those values target the local Typesense endpoint and API key as documented

#### Scenario: Chat section present
- **WHEN** a developer opens `.env.example`
- **THEN** a documented chat / LLM adapter section exists (values may be placeholders)

### Requirement: Local Compose stand-ins via root scripts
The repository MUST provide root scripts `docker:local:up` and `docker:local:down` that start and stop local **Postgres (AGE image)**, **Typesense**, and **S3-compatible** services under `infra/`. Starting these MUST NOT require changing into an `apps/` directory.

#### Scenario: Bring data plane up from root
- **WHEN** a developer runs `pnpm run docker:local:up` from the repo root with Docker available
- **THEN** Postgres, Typesense, and the S3-compatible stand-in become reachable using the host/ports implied by `.env.example`

#### Scenario: Tear data plane down from root
- **WHEN** a developer runs `pnpm run docker:local:down` from the repo root
- **THEN** the local Compose stand-ins for Postgres, Typesense, and object storage are stopped
