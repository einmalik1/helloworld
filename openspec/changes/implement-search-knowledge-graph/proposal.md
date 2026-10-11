## Why

Wave C needs secondary graph exploration and full-text search over Hello World entities without a public `apps/graph` or engine credentials in clients. Spec and ADR 0006 already freeze AGE + Typesense behind the api/platform facade; the code path (image, health probe, facade routes, worker sync, Cytoscape, MCP HTTP tools) is still intent-only.

## What Changes

- Pin local/Coolify Postgres to an **AGE-enabled** image under `infra/postgres`; keep Typesense in Compose; wire `TYPESENSE_*` into api/worker config.
- Add transactional **`search_sync_outbox`** (schema + Drizzle) for async projection; worker schedule jobs drain outbox and rebuild AGE + Typesense from Postgres SoT.
- Implement platform search/graph use-cases and adapters (AGE Cypher + Typesense HTTP); Nest api routes `GET /graph/related`, `GET /graph/subgraph`, `GET /search`; Typesense probe on `GET /health`.
- Add Cytoscape explorer in `apps/web` consuming api JSON only; MCP tools that HTTP-call those api routes only.
- Do **not** re-open facade ADRs 0001–0006; do **not** sync-on-write on the api request path.

## Capabilities

### New Capabilities

- (none — `search-knowledge-graph` already exists as a main capability)

### Modified Capabilities

- `search-knowledge-graph`: Pin implementable contracts for AGE image, Typesense health probe, api facade routes, worker outbox/rebuild, Cytoscape, and MCP HTTP-only access (delta clarifies wired behavior vs intent-only baseline).
- `local-dev-runtime`: Require Compose Postgres service to use the AGE-enabled image from `infra/postgres` (not stock `postgres:18` when graph is exercised).
- `worker-jobs`: Clarify that search/graph projection drain + rebuild are first-class `@nestjs/schedule` jobs owned by `apps/worker`.

## Impact

- Primary: `infra/postgres`, `infra/docker-compose.yml`, `openspec/data-model/schema.sql`, `packages/modules` (outbox schema, Typesense health), `packages/platform`, `apps/api` (graph/search modules + env), `apps/worker` (scaffold + sync jobs), `apps/web` (Cytoscape), `apps/mcp` (HTTP tools).
- Depends on: `#40` api scaffold + modules (done). Prefer `#47` worker; this change scaffolds the minimal worker surface needed for projection sync if worker package is still README-only.
- Unlocks: searchable/graph-browsable domain data once Wave B CRUD writes outbox rows (rebuild works from tables immediately).
