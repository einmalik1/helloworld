# Spec Delta

## MODIFIED Requirements

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
