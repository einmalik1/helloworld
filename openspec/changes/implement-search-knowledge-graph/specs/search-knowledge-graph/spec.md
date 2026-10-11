## ADDED Requirements

### Requirement: API exposes retrieve and search facade routes

`apps/api` MUST expose authenticated `GET /graph/related`, `GET /graph/subgraph`, and `GET /search` returning product JSON (`{ nodes, edges }` / `{ items, total }`) as specified in ADR 0006. Callers MUST NOT receive Cypher, Typesense protocol payloads, or engine URLs.

#### Scenario: Related neighbors via product JSON

- **WHEN** an authenticated client calls `GET /graph/related` with `entityType` and `entityId`
- **THEN** the response is `{ nodes, edges }` for neighbors of that entity

#### Scenario: Search hits via product JSON

- **WHEN** an authenticated client calls `GET /search` with `q`
- **THEN** the response is `{ items: [{ id, type, title, body?, score? }], total }` from the Typesense-backed index via the facade

### Requirement: Health includes Typesense probe

`GET /health` on `apps/api` MUST probe Typesense in addition to Postgres. AGE availability is covered by the Postgres DB ping on the AGE-enabled image.

#### Scenario: Typesense down is visible in health

- **WHEN** Typesense is unreachable and an operator calls `GET /health`
- **THEN** the health payload reports a Typesense failure without requiring a separate graph-app health endpoint

### Requirement: Worker owns AGE and Typesense projection

`apps/worker` MUST drain `search_sync_outbox` and offer a rebuild job that projects domain rows into the AGE graph and Typesense collection `helloworld`. Api request handlers MUST NOT write Typesense or AGE as sync-on-write.

#### Scenario: Rebuild populates secondary indexes

- **WHEN** the rebuild job runs against populated person/channel/greeting/reaction tables
- **THEN** AGE graph vertices/edges and Typesense documents are upserted from Postgres SoT

### Requirement: Cytoscape and MCP use API only

`apps/web` graph explorer (Cytoscape.js) and `apps/mcp` retrieve/search tools MUST call product API routes only — never AGE or Typesense endpoints or credentials.

#### Scenario: Web graph explorer talks to api

- **WHEN** a user opens the graph explorer
- **THEN** the browser fetches `/graph/related` or `/graph/subgraph` from the product API

#### Scenario: MCP tool does not embed engine credentials

- **WHEN** an agent invokes an MCP search or graph tool
- **THEN** the tool performs an HTTP call to `apps/api` retrieve/search routes
