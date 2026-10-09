# 0004 — Search / knowledge-graph (AGE + Typesense + api facade)

## Status

Accepted

## Context

Hello World needs graph exploration and full-text search over domain entities (person, channel, greeting, reaction) without replacing Postgres as the system of record. Contested choices: separate graph DB vs Postgres-adjacent graph; search engine; public graph app vs api facade; sync-on-write vs worker; whether MCP/CLI talk to engines directly.

Issue: [#12](https://github.com/einmalik1/helloworld/issues/12) (tech-stack topic **#16**). Cross-link MCP/worker: [#6](https://github.com/einmalik1/helloworld/issues/6) (topic **#4**). Architecture: [`architecture.md` § Search / knowledge graph](../architecture.md#search--knowledge-graph-secondary-indexes). Inventory: [`tech-stack.md` § Search / knowledge graph](../tech-stack.md#search--knowledge-graph).

## Decision

1. **Graph engine: Apache AGE** on the same Postgres instance as the relational SoT (OSS, Apache-2.0). Cypher stays inside api/worker; **not** exposed to clients. Requires a **custom Postgres image** with the extension baked in (local Compose + Coolify pin) — stock Coolify one-click Postgres cannot `CREATE EXTENSION age`.
2. **Search engine: Typesense** (OSS, GPL-3.0) under `infra/typesense` — Compose stand-in locally; Coolify service in QA/Prod. Full-text / typo-tolerant in v1; vector later only if needed.
3. **No public `apps/graph`.** Graph projection lives in Postgres/AGE; thin helpers may live inside `apps/api` / `apps/worker`. All product traffic is `apps/api`.
4. **Product API facade on `apps/api`:** structured retrieve/search only — `GET /graph/related`, `GET /graph/subgraph`, `GET /search`. Response shapes are product JSON (`{ nodes, edges }` / search hits). No Cypher, no Typesense protocol, no engine URLs to CLI/TUI/Web/MCP.
5. **Graph UI: Cytoscape.js** in `apps/web` — consumes api retrieve JSON only.
6. **Role: secondary indexes.** Writes always API → Postgres first. Worker syncs AGE projection + Typesense **after** writes (transactional outbox drained by `@nestjs/schedule` jobs; plus a rebuild job). **Not** sync-on-write on the request path.
7. **Auth:** Better Auth on `apps/api` for retrieve/search routes. AGE and Typesense are network-internal; only api/worker (S2S) reach them.
8. **Health:** `GET /health` on api keeps Postgres DB ping (covers AGE on the same DB) and adds a **Typesense** probe. No separate graph-app health.
9. **Env:** Typesense via root `.env` `TYPESENSE_*`; AGE via the same `DATABASE_URL` plus extension bootstrap on the custom image.

### Domain projection (v1)

| Node type | Source table | Indexed text (Typesense) |
|---|---|---|
| `person` | `person` | display name / handle fields as present in DDL |
| `channel` | `channel` | name / slug |
| `greeting` | `greeting` | body text |
| `reaction` | `greeting_reaction` | reaction kind / emoji (lightweight; optional in search) |

| Edge type | Meaning |
|---|---|
| `authored` | `person` → `greeting` (`greeting.author_id`) |
| `posted_in` | `greeting` → `channel` (`greeting.channel_id`) |
| `reacted_to` | `person` → `greeting` via `greeting_reaction` |
| `reaction_on` | `reaction` → `greeting` |

### Typesense collection (v1)

One collection **`helloworld`** with documents:

| Field | Role |
|---|---|
| `id` | `{type}:{uuid}` |
| `type` | `person` \| `channel` \| `greeting` \| `reaction` |
| `title` | Primary display string |
| `body` | Searchable text (optional) |
| `refId` | Domain UUID |
| `updatedAt` | ISO timestamp for sync |

Facet on `type`. Vector fields deferred.

### Retrieve / search OpenAPI shapes (v1)

| Method | Path | Auth | Response |
|---|---|---|---|
| `GET` | `/graph/related` | session or `x-api-key` | `{ nodes, edges }` for neighbors of one entity |
| `GET` | `/graph/subgraph` | session or `x-api-key` | `{ nodes, edges }` for ego network up to `depth` (default `1`, max `3`) |
| `GET` | `/search` | session or `x-api-key` | `{ items: [{ id, type, title, body?, score? }], total }` |

Query params (intent): `entityType`, `entityId`, `depth` for graph; `q`, `types` (comma-separated), `limit` (default `20`, max `100`) for search.

## Consequences

- Coolify Postgres must use the **AGE-enabled custom image**, not an unmodified one-click image, for local/QA/Prod parity.
- Implementers add retrieve/search modules on `apps/api`, Cytoscape explorer on `apps/web`, outbox + projection jobs on `apps/worker`, and MCP tools that only HTTP-call those api routes.
- Root `.env` gains a Typesense section; api `envSchema` includes `TYPESENSE_*` when search is wired.
- Topic **#4** MCP access path stays HTTP → api; this ADR forbids MCP→Typesense/AGE shortcuts.

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Separate graph DB as v1 default (Neo4j, Memgraph, FalkorDB, SurrealDB) | Extra ops surface; AGE keeps graph next to SoT with OSS + Postgres adjacency |
| OpenViking as domain graph/search | Agent-context tool only; out of band for product graph/search |
| Public `apps/graph` or exposing Cypher / Typesense URLs to CLI/TUI/MCP | Breaks single facade, auth, and client contracts |
| Sync-on-write in the API request path | Couples latency/availability to secondary indexes; worker/outbox preferred (#4) |
| Vector-first / Elasticsearch-only as the graph story | Overkill for v1; Typesense covers typo-tolerant search; graph is AGE |
| Stock Coolify Postgres without custom image | Cannot load AGE (`CREATE EXTENSION age` requires baked-in extension) |
