## ADDED Requirements

### Requirement: Greeting HTTP resource surface

The HTTP API MUST expose greeting CRUD under `/greeting` and `/greeting/:id` per the shared HTTP contract: `POST` → 201, `GET` by id, `GET` list with `{ items, total, page, limit }`, `PATCH` partial update, `DELETE` → 204. Controllers MUST stay thin and invoke `@helloworld/platform` greeting use-cases (not duplicate persistence rules).

#### Scenario: Create then get by id

- **WHEN** an authenticated client creates a greeting with valid author_id, channel_id, and message, then GETs `/greeting/:id`
- **THEN** the response body matches the stored greeting fields

### Requirement: List greetings filter by channel

List MUST accept optional query `channel_id` (UUID) plus shared pagination `page` / `limit` (max 100). When `channel_id` is present, only greetings for that channel are returned.

#### Scenario: Filter list to one channel

- **WHEN** greetings exist on multiple channels and a client lists with `channel_id` set to one channel
- **THEN** every returned item has that `channel_id` and `total` reflects only that filtered set

## MODIFIED Requirements

### Requirement: Greeting CRUD via platform and API

The system MUST support create, read, list, update (PATCH), and delete for greetings through `@helloworld/platform` use-cases and the HTTP API under the shared HTTP contract. Platform use-cases MUST return neverthrow `Result` values using `@helloworld/types` error classes (`NotFound`, `ValidationError`, `DatabaseError`). Nest feature services MUST delegate to those use-cases with the process Drizzle handle from `DatabaseService`.

#### Scenario: List can filter by channel

- **WHEN** greetings exist on multiple channels
- **THEN** list supports selecting greetings for a given channel (query `channel_id`)

#### Scenario: Missing greeting returns NotFound

- **WHEN** a client reads, updates, or deletes a greeting id that does not exist
- **THEN** the platform use-case returns `NotFound` and the API maps it to Problem Details 404
