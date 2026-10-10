# Spec Delta

## MODIFIED Requirements

### Requirement: Postgres remains system of record
Authoritative domain writes MUST go to Postgres. Search/graph MUST be treated as a secondary index/exploration layer that can be rebuilt from Postgres. Graph projection MUST use **Apache AGE** on the same Postgres instance (not a separate graph database in v1).

#### Scenario: Graph outage does not block CRUD SoT
- **WHEN** AGE or Typesense is unavailable
- **THEN** core person/channel/greeting CRUD against Postgres MUST still work; search/graph features MAY degrade

### Requirement: Access only via API MCP and platform
Web, CLI, and TUI MUST NOT connect directly to AGE or Typesense. Agents MUST use MCP tools backed by platform/API. Human/HTTP clients MUST use the product API. There MUST NOT be a public `apps/graph` surface.

#### Scenario: CLI does not embed graph credentials
- **WHEN** a CLI user runs a “related greetings” style command
- **THEN** the CLI calls the product API (api-client), not the graph engine URL with engine credentials

#### Scenario: CLI does not embed Typesense credentials
- **WHEN** a CLI user runs a search command
- **THEN** the CLI calls the product API (api-client), not Typesense URLs with engine credentials

### Requirement: Sync model is explicit and async-capable
AGE projection and Typesense indexing MUST be updated asynchronously via worker jobs (outbox/rebuild). Product APIs MUST NOT assume instantaneous index updates after writes unless a later ADR adds an SLA. Sync MUST NOT run as sync-on-write on the API request path by default.

#### Scenario: Write then search may lag
- **WHEN** a greeting is created via the API
- **THEN** search/graph visibility MAY lag until worker sync completes

### Requirement: Engine choice recorded in ADR without blocking facade
Template v1 MUST use **Apache AGE** (graph) and **Typesense** (search) as recorded in ADR 0006. The product facade MUST expose structured retrieve/search over HTTP (e.g. `GET /graph/*`, `GET /search`) returning product JSON (`{ nodes, edges }` / search hits). Engine swap later MUST keep those client contracts.

#### Scenario: Engine swap keeps API contract
- **WHEN** the template switches search/graph engines behind the facade
- **THEN** external clients continue to use the same API/MCP surfaces; only adapters change

## ADDED Requirements

### Requirement: Typesense is the v1 full-text index
Full-text / typo-tolerant search in v1 MUST use Typesense under `infra/typesense` (local Compose + Coolify-capable). `GET /health` on the API MUST include a Typesense probe in addition to Postgres (AGE covered by DB ping).

#### Scenario: Health probes Typesense
- **WHEN** an operator calls `GET /health` with Typesense down
- **THEN** health reports Typesense failure without requiring a separate graph-app health endpoint

### Requirement: Graph UI consumes API JSON only
Any graph explorer in `apps/web` (e.g. Cytoscape.js) MUST consume API retrieve JSON only — not Cypher, not Typesense protocols.

#### Scenario: Web graph viz does not talk to AGE
- **WHEN** a user opens the graph explorer in the web app
- **THEN** the browser only calls product API routes for graph data
