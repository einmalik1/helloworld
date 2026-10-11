## Context

ADR **0006** freezes Apache AGE + Typesense behind `apps/api` / platform; ADR **0007** freezes Nest `@nestjs/schedule` + Postgres outbox (not pg-boss). Main capability `search-knowledge-graph` and READMEs describe contracts; compose still uses stock `postgres:18`, platform is a placeholder, worker/mcp are README-only, api has no `/graph/*` or `/search`, health has no Typesense probe. Ticket `#52` must not re-open ADRs 0001–0006. `#40` api scaffold is done; `#47` worker may still be in flight — this change scaffolds the minimal worker needed for projection sync.

In-force ADRs reviewed: 0001–0004, 0006–0008 (0005 superseded by 0007).

## Goals / Non-Goals

**Goals:**

- AGE-enabled Postgres image + Compose pin; Typesense already present — keep pin documented.
- `search_sync_outbox` in SQL SoT + Drizzle; platform search/graph ports; api facade + Typesense health; worker drain/rebuild; web Cytoscape; MCP HTTP tools.
- Package smokes that pass without requiring Coolify for the gate.

**Non-Goals:**

- Wave B domain CRUD controllers (outbox enqueue helpers may exist for later wiring).
- Re-opening ADR 0006 engine/facade choices; public `apps/graph`; sync-on-write on api.
- Full Nightly QA; Coolify Application create (shipper later). Design-system token work.

## Decisions

1. **Postgres image:** `infra/postgres/Dockerfile` `FROM apache/age:release_PG18_1.8.0` (PG 18.6 + AGE 1.8.0). Compose `postgres` builds/uses that image; document Coolify `--image` pin. Bootstrap: image init creates extension; migration/SQL also idempotent `CREATE EXTENSION IF NOT EXISTS age` only if we add a SQL bootstrap — prefer image init + worker `LOAD 'age'` / `create_graph` on rebuild (no Nest runtime DDL for domain).

2. **Outbox table** `search_sync_outbox` in `schema.sql` (category infra/ops): `id`, `aggregate_type`, `aggregate_id`, `op` (`upsert`|`delete`), `payload` jsonb nullable, `created_at`, `processed_at` nullable. Index on unprocessed (`processed_at IS NULL`).

3. **Platform** (`@helloworld/platform`):
   - Types: `GraphNode`, `GraphEdge`, `GraphView`, `SearchHit`, `SearchResult`.
   - Ports: `GraphStore` (related/subgraph), `SearchIndex` (search + upsert/delete/ensureCollection), `ProjectionSync` (applyOutboxRow, rebuild).
   - Adapters: AGE via raw SQL/`cypher()` on `postgres` client; Typesense via fetch HTTP (`TYPESENSE_*`).
   - Nest apps inject adapters; MCP uses platform or thin HTTP to api — **MCP tools HTTP → api** per ADR (no direct Typesense/AGE from MCP).

4. **Api modules** `graph` + `search` under `apps/api/src/`: controllers call platform use-cases; auth via existing global Better Auth guard (session or `x-api-key`). Env: add `TYPESENSE_HOST|PORT|PROTOCOL|API_KEY` to `envSchema`.

5. **Health:** `TypesenseHealthIndicator` in `@helloworld/modules` (or api-local provider importing Terminus); `HealthController` adds Typesense check. If Typesense env missing in pure unit smoke, override/mock indicator like DB.

6. **Worker scaffold:** Minimal Nest app (`apps/worker`) with config/db/logger/schedule + `ProjectionModule` (outbox drain interval + rebuild cron or on-start once for smoke). Shares platform adapters. Health optional internal GET `/health`.

7. **Web:** `apps/web/graph.html` (+ tiny JS) loading Cytoscape from npm or CDN; calls `PUBLIC_API_URL` graph routes with credentials/api-key prompt — keep as thin static page consistent with current `chat.html` serve setup (Vite shell is `#50`).

8. **MCP:** Minimal Nest or SDK server tools `search`, `graph_related`, `graph_subgraph` that `fetch` api routes with `x-api-key` from env — no engine URLs.

9. **Smoke:** Extend api HTTP smoke for route registration + Typesense env defaults; platform unit tests for JSON shapes; worker smoke that ScheduleModule boots; optional skip live AGE/Typesense in CI by mocking adapters. Document `pnpm --filter api smoke` (+ modules/platform/worker) as gate.

## Risks / Trade-offs

- **[Risk] `#47` overlaps worker scaffold** → Mitigation: keep worker surface minimal and projection-focused; later worker ticket absorbs generic job infra without forking.
- **[Risk] AGE Cypher quirks / graph not created** → Mitigation: rebuild job creates graph `helloworld` and is idempotent; related/subgraph return empty `{ nodes: [], edges: [] }` when entity missing.
- **[Risk] Domain CRUD not writing outbox yet** → Mitigation: rebuild from tables; export `enqueueSearchSync` for Wave B.
- **[Trade-off] apache/age upstream image vs fully custom build** → Thin Dockerfile FROM upstream satisfies “custom image under infra/postgres” with pin control.

## Migration Plan

1. Land SQL outbox + generate drizzle + migration; switch Compose to AGE image (local volume may need recreate).
2. Ship platform + api + health + worker + web + mcp; smoke green; park `ready-for-deployment`.
3. Wave B CRUD adds outbox writes; `#47` may thicken worker without changing facade contracts.

## Open Questions

- None blocking. ADR 0006/0007 remain SoT.
