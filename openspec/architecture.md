# Architecture

System picture and component boundaries for Hello World — technology-agnostic.

Keep it factual. Chosen technologies live in [`tech-stack.md`](tech-stack.md). Rationale for contested choices lives in [`decisions/`](decisions/).

## Components

See root `README.md` for the layout inventory (`apps/`, `tools/`, `infra/`, `tests/`, `spark/`, `packages/`).

### Search / knowledge graph (secondary indexes)

Graph exploration and full-text search sit **beside** Postgres, not instead of it. Postgres remains the system of record; clients never talk to the graph or search engines directly.

| Piece | Role | Boundary |
|---|---|---|
| Relational SoT | Postgres (domain tables) | All writes: clients → `apps/api` → DB first |
| Graph projection | Cypher-capable layer **in the same Postgres** (extension) | No public `apps/graph`; no separate graph DB in v1 |
| Search index | Dedicated search service under `infra/` | Network-internal; indexed from worker jobs |
| Product facade | Structured retrieve/search routes on `apps/api` | Clients get `{ nodes, edges }` / search hits only — not engine protocols |
| Graph UI | `apps/web` viz over API JSON | Consumes retrieve JSON only |
| Sync | `apps/worker` after writes (outbox / jobs) | Not sync-on-write on the API request path |
| Agents | `apps/mcp` tools | Call `apps/api` retrieve/search only — never AGE/search URLs |
| Chat | `apps/chat` | LLM + streaming; web is client only — [ADR 0008](decisions/0008-chat-service-app.md) |

```text
Clients (web / CLI / TUI / MCP)
    │  HTTP + auth
    ▼
apps/api  ── write ──►  Postgres (SoT) + graph extension
    │                       │
    │                       │  worker outbox / jobs
    │                       ▼
    │                  apps/worker ──► graph projection
    │                              └─► search index
    │
    ├── GET graph retrieve  → { nodes, edges }
    └── GET /search         → search hits

apps/web ── graph viz ──► retrieve JSON only
apps/web ── chat UI   ──► apps/chat ──► LLM provider (server-side only)
```

Chosen engines and deploy shape: [`tech-stack.md`](tech-stack.md#search--knowledge-graph). Rationale: [`decisions/0006-search-knowledge-graph.md`](decisions/0006-search-knowledge-graph.md).

## Configuration boundary

Runtime configuration for all services and tools is a **single repo-root env file** (sectioned by component). Components validate only the keys they need; they do not each own a private env file. Details: root `README.md` (Environment) and [`tech-stack.md`](tech-stack.md#root-environment).

## Data model

Authoritative DDL: [`data-model/schema.sql`](data-model/schema.sql).  
Regenerate: `pnpm generate` (or `pnpm generate:erd`) — Python generators under `spark/generators/`, config in `spark/repo-profile.yaml` → [`data-model/generated/`](data-model/generated/).

## Related

| Doc | Role |
|---|---|
| [`tech-stack.md`](tech-stack.md) | Tech stack inventory |
| [`features/`](features/) | Behaviour / acceptance |
| [`decisions/`](decisions/) | ADRs |
| Root `CONTEXT.md` | Ubiquitous language |
