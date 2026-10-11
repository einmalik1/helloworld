## MODIFIED Requirements

### Requirement: Local Compose data services

The repository MUST provide root scripts `docker:local:up` and `docker:local:down` that start and stop local **Postgres (AGE-enabled image from `infra/postgres`)**, **Typesense**, and **S3-compatible** services under `infra/`. Starting these MUST NOT require changing into an `apps/` directory. The Compose Postgres service MUST NOT use unmodified stock `postgres:18` as the graph-capable default once the AGE image is wired.

#### Scenario: Local up brings AGE Postgres and Typesense

- **WHEN** a developer runs `pnpm run docker:local:up` from the repo root
- **THEN** AGE-enabled Postgres, Typesense, and the S3-compatible stand-in become reachable using the host/ports implied by `.env.example`
