## MODIFIED Requirements

### Requirement: Channel CRUD via platform and API
The system MUST support create, read, list, update (PATCH), and delete for channels through `@helloworld/platform` use-cases and the HTTP API under the shared HTTP contract (`POST/GET /channel`, `GET/PATCH/DELETE /channel/:id`). Nest controllers MUST call platform in-process (not duplicate Drizzle CRUD). List responses MUST use `{ items, total, page, limit }`. Create MUST return **201**; delete MUST return **204**.

#### Scenario: List includes created channel
- **WHEN** a client creates a channel and then lists channels
- **THEN** the new channel appears in the list results

#### Scenario: Get returns created channel
- **WHEN** a client creates a channel and then GETs `/channel/:id` with that id
- **THEN** the response body matches the created channel fields

#### Scenario: Delete removes channel
- **WHEN** a client deletes an existing channel by id
- **THEN** the response is **204** and a subsequent GET for that id fails with NotFound

## ADDED Requirements

### Requirement: Duplicate slug maps to typed validation error
Creating or updating a channel with a `slug` that already exists MUST fail with a typed `ValidationError` (HTTP **400** Problem Details via the global filter). The implementation MUST detect Postgres unique violations on `channel.slug` without string-sniffing free-text success paths.

#### Scenario: Duplicate slug on create
- **WHEN** a client creates a channel with a slug that already exists
- **THEN** the operation fails with `ValidationError` and the API responds **400** `application/problem+json`
