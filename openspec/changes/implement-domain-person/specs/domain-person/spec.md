## ADDED Requirements

### Requirement: Person HTTP routes under /person
The API MUST expose Person CRUD at `/person` and `/person/:id` using UUID ids, create → **201**, delete → **204**, PATCH for partial update, and list responses shaped as `{ items, total, page, limit }` with `page`/`limit` query params (limit max 100), consistent with the shared API HTTP contract.

#### Scenario: Create returns 201 with person body
- **WHEN** a client POSTs a valid `display_name` and unique `email` to `/person`
- **THEN** the response status is `201` and the body includes `id`, `display_name`, `email`, and `created_at`

#### Scenario: List returns paginated envelope
- **WHEN** a client GETs `/person` with optional `page` and `limit`
- **THEN** the response is `{ items, total, page, limit }` where `items` are person representations

### Requirement: Person use-cases live in platform
Person create, get-by-id, list, update, and delete MUST be implemented as `@helloworld/platform` use-cases returning neverthrow `Result` values. Nest controllers MUST stay thin and MUST NOT embed Drizzle/SQL or duplicate those use-case rules.

#### Scenario: API delegates to platform use-cases
- **WHEN** the Nest Person feature handles a create or get-by-id request
- **THEN** persistence rules (including duplicate-email rejection and not-found) are enforced by platform use-cases rather than controller-local SQL

## MODIFIED Requirements

### Requirement: Person CRUD via platform and API
The system MUST support create, read, list, update (PATCH), and delete for persons through `@helloworld/platform` and the HTTP API under the shared HTTP contract. Duplicate email MUST fail with a typed validation outcome mapped by the global exception filter (HTTP **400** Problem Details). Missing id MUST map to typed not-found (**404**).

#### Scenario: Create then get by id
- **WHEN** a client creates a person and then GETs by id
- **THEN** the stored display_name and email match what was created

#### Scenario: Duplicate email rejected
- **WHEN** a client creates a person with an email that already exists
- **THEN** the operation fails with HTTP 400 `application/problem+json` from the typed validation mapping (not string sniffing)
