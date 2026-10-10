# search-knowledge-graph Specification

## Purpose
Defines search / knowledge-graph as a secondary exploration index over Hello World entities: Postgres remains system of record; clients reach search/graph only through API, MCP, and platform — never as a second public stack for web/CLI.

## Requirements

### Requirement: Postgres remains system of record
Authoritative domain writes MUST go to Postgres. Search/graph MUST be treated as a secondary index/exploration layer that can be rebuilt from Postgres.

#### Scenario: Graph outage does not block CRUD SoT
- **WHEN** the search/graph engine is unavailable
- **THEN** core person/channel/greeting CRUD against Postgres MUST still be specified to work; search features may degrade

### Requirement: Access only via API MCP and platform
Web, CLI, and TUI MUST NOT connect directly to the search/graph engine. Agents MUST use MCP tools (backed by platform). Human/HTTP clients MUST use the API. Platform owns adapters to the engine.

#### Scenario: CLI does not embed graph credentials
- **WHEN** a CLI user runs a “related greetings” style command
- **THEN** the CLI calls the product API (api-client), not the graph engine URL with engine credentials

### Requirement: Sync model is explicit and async-capable
How the graph/search index stays current MUST be documented (worker jobs / outbox / rebuild). Sync MAY be asynchronous; product APIs MUST NOT assume instantaneous index updates unless explicitly stated.

#### Scenario: Write then search may lag
- **WHEN** a greeting is created via the API
- **THEN** search/graph visibility may lag until sync completes, and that lag is an accepted property of the design unless a sync-on-write SLA is separately specified

### Requirement: Engine choice recorded in ADR without blocking facade
The concrete engine (Neo4j, Memgraph, AGE, Meilisearch, …) MUST be chosen in an ADR for the template, but the facade requirements above MUST hold regardless of engine.

#### Scenario: Engine swap keeps API contract
- **WHEN** the template switches graph/search engines
- **THEN** external clients continue to use the same API/MCP surfaces; only platform adapters change
