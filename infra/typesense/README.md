# typesense

Full-text / typo-tolerant search index for Hello World (secondary to Postgres). Product traffic reaches Typesense **only** via `apps/api` (`GET /search`) and `apps/worker` (index sync) — never from CLI/TUI/Web/MCP directly.

Inventory: [`spec/tech-stack.md` § Search / knowledge graph](../../spec/tech-stack.md#search--knowledge-graph). ADR: [`0004`](../../spec/decisions/0004-search-knowledge-graph.md).

**Prod / QA:** Typesense as a Coolify service (or equivalent container) on the private network with api/worker. **Local:** Compose stand-in in this folder / root Compose.

## Local

```bash
pnpm run docker:local:up          # intent — includes typesense
# or:
docker compose up -d typesense
```

**Compose (intent):** service `typesense` in the root Compose file (or included from `infra/typesense`). Host/port/key from root `.env` (`TYPESENSE_*` section) — no `infra/typesense/.env`.

| Concern | Contract |
|---|---|
| Default local listen | `localhost:8108` (`TYPESENSE_HOST` / `TYPESENSE_PORT`) |
| Auth | `TYPESENSE_API_KEY` — server-side only (api + worker) |
| Collection (v1) | `helloworld` — documents `{ id, type, title, body?, refId, updatedAt }`; facet `type` |
| Sync | Worker outbox / rebuild jobs upsert and delete; api does not write Typesense on the request path |
| Health | Api `GET /health` probes Typesense when search is wired |
| Forbidden | Publishing Typesense admin UI/API to the public internet; embedding the key in web/CLI |

Needed when wiring retrieve/search and projection jobs. Pin the Typesense image version in Compose/Coolify when implementing.
