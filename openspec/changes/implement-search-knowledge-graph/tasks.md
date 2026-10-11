## 1. Infra — AGE Postgres + Typesense pin

- [x] 1.1 Add `infra/postgres/Dockerfile` FROM `apache/age:release_PG18_1.8.0`; update `infra/docker-compose.yml` postgres service to build/use it; document pin in `infra/postgres/README.md`
- [x] 1.2 Confirm Typesense service + `.env.example` `TYPESENSE_*` remain aligned; note image pin in `infra/typesense/README.md` if missing

## 2. Schema — search sync outbox

- [x] 2.1 Add `search_sync_outbox` to `openspec/data-model/schema.sql` per change `data-model.md`
- [x] 2.2 Run generate (drizzle) + `pnpm db:generate` so Drizzle schema/migration include the outbox table

## 3. Platform — search / graph facade

- [x] 3.1 Add product types + `GraphStore` / `SearchIndex` / `ProjectionSync` ports and AGE + Typesense adapters in `@helloworld/platform`
- [x] 3.2 Export use-case helpers (related, subgraph, search, enqueue, rebuild/drain); add package typecheck/build

## 4. Modules + API — health and routes

- [x] 4.1 Add Typesense health indicator and wire into `HealthModule` / `GET /health`
- [x] 4.2 Extend api `envSchema` with `TYPESENSE_*`; add `graph` + `search` Nest feature modules (`/graph/related`, `/graph/subgraph`, `/search`) calling platform; import in `AppModule`
- [x] 4.3 Extend api smoke for facade route registration / health composition; keep Problem Details smoke green

## 5. Worker — outbox drain + rebuild

- [x] 5.1 Scaffold Nest `apps/worker` (package.json, config, AppModule, schedule) sharing modules + platform
- [x] 5.2 Implement outbox drain interval + rebuild job projecting domain → AGE graph `helloworld` + Typesense collection `helloworld`
- [x] 5.3 Add worker smoke (boots ScheduleModule / projection providers)

## 6. Web + MCP clients

- [x] 6.1 Add Cytoscape graph explorer page in `apps/web` that fetches api graph JSON only
- [x] 6.2 Add MCP tools that HTTP-call api retrieve/search only (no AGE/Typesense URLs)

## 7. Verification

- [x] 7.1 Run format/lint/typecheck/build and package smokes for touched packages; fix until green
