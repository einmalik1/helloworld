# Spec Delta

## MODIFIED Requirements

### Requirement: Env example covers shared data plane
`.env.example` MUST document Shared, Postgres (`DATABASE_URL`), object-storage (`S3_*`), and **Typesense (`TYPESENSE_*`)** sections suitable for local Compose stand-ins, plus documented service sections for apps. AGE MUST be available via the same `DATABASE_URL` against an AGE-enabled local Postgres image (not stock Postgres without the extension when graph features are exercised).

#### Scenario: Postgres URL matches local stand-in intent
- **WHEN** a developer uses the default `DATABASE_URL` from `.env.example` with local Postgres up
- **THEN** the URL targets the local Compose Postgres service (host/port/db/user as documented)

#### Scenario: S3 keys match local stand-in intent
- **WHEN** a developer uses the default `S3_*` values from `.env.example` with local object storage up
- **THEN** those values target the local S3-compatible stand-in endpoint and credentials as documented

#### Scenario: Typesense keys match local stand-in intent
- **WHEN** a developer uses the default `TYPESENSE_*` values with local Typesense up
- **THEN** those values target the local Typesense endpoint and API key as documented

### Requirement: Local Compose stand-ins via root scripts
The repository MUST provide root scripts `docker:local:up` and `docker:local:down` that start and stop local **Postgres (AGE image)**, **Typesense**, and **S3-compatible** services under `infra/`. Starting these MUST NOT require changing into an `apps/` directory.

#### Scenario: Bring data plane up from root
- **WHEN** a developer runs `pnpm run docker:local:up` from the repo root with Docker available
- **THEN** Postgres, Typesense, and the S3-compatible stand-in become reachable using the host/ports implied by `.env.example`

#### Scenario: Tear data plane down from root
- **WHEN** a developer runs `pnpm run docker:local:down` from the repo root
- **THEN** the local Compose stand-ins for Postgres, Typesense, and object storage are stopped
