# Tech-stack specification backlog

Working backlog for closing **specification** gaps against [`tech-stack.md`](tech-stack.md) and component READMEs so this monorepo can serve as a strong template before implementation waves.

Useful patterns from a prior Nest/CLI project were **salvaged into the topic sections below** (marked *Prior reference*). Do not re-import that foreign doc; product-specific encyclopedias (meetings, dual-mode binary, static `API_KEY`, runtime DDL) stay rejected — see Appendix.

## Product vs process

Only two decision lanes:

| Lane | Meaning | Typical homes |
|---|---|---|
| **Product** | What the running system *is*: components, architecture/boundaries, stack & versions, integration paths, runtime contracts (API, auth, health, deploy shape) | [`architecture.md`](architecture.md), [`tech-stack.md`](tech-stack.md), app/infra READMEs, [`features/`](features/), ADR *content* |
| **Process** | How we *build and steer* it: repo layout, where specs/ADRs/docs live, generators, coding conventions, quality gates, git/agent workflow | Root [`README.md`](../README.md), `spark/agents/common/`, generator docs, convention sections in READMEs, ADR *format/location* |

ADR files live under **process** (when/where/how we record). The decision *inside* an ADR is often **product**.

Topic numbers (`#1` … `#16`) are stable for cross-links; they are grouped under the two chapters below.

**Status key**

| Status | Meaning |
|---|---|
| Spec open | Decisions / contracts / conventions not (fully) written |
| Spec done | Direction documented; only wiring remains |
| Impl open | Expected until implementation phase (listed for completeness) |
| Decide | Explicit choice required (`define …`) before writing the contract |

**Placement convention** (already used in this repo)

| Kind of content | Where |
|---|---|
| Inventory / contested tech choice | [`tech-stack.md`](tech-stack.md) (+ ADR under [`decisions/`](decisions/) when contested) |
| Nest / API conventions | [`apps/api/README.md`](../apps/api/README.md) |
| Shared Nest infra contracts | [`packages/modules/README.md`](../packages/modules/README.md) |
| Client SDK / transport | [`packages/api-client/README.md`](../packages/api-client/README.md) |
| Terminal toolkit | [`packages/terminal/README.md`](../packages/terminal/README.md) + [`tools/cli`](../tools/cli/README.md) / [`tools/tui`](../tools/tui/README.md) |
| App-specific deploy / local | that app’s README |
| Process / agent workflow | `spark/agents/common/` (optional mirror in READMEs) |

**Already closed in spec**

- **#2 Build / emit contract** (process) — written in [`tech-stack.md`](tech-stack.md#build--emit-contract). Remaining work is mostly implementation (flip `exports` to `dist/`, wire `build` / `turbo.json`).
- **#5 Better Auth wiring** (product) — [`tech-stack.md` § Auth](tech-stack.md#auth-better-auth) + modules / api-client / api / terminal contracts + ADR [`0003`](decisions/0003-better-auth.md).
- **#10 Security / ops baseline** (product) — [`apps/api/README.md` § Security / ops](../apps/api/README.md#security--ops-baseline) + pointers in [`tech-stack.md`](tech-stack.md#security--ops-baseline).
- **#6 Workflow “new resource”** (process) — checklist in [`spark/agents/common/conventions.md#new-resource-workflow`](../spark/agents/common/conventions.md#new-resource-workflow); Nest mirror + generators pointers.
- **#8 TypeScript / module contract** (process) — [`tech-stack.md` § Module / compiler](tech-stack.md#module--compiler-rules-all-ts-workspaces) + [`packages/config/README.md`](../packages/config/README.md) (ES2024 target, SWC Vitest-only, Nest DI spike).
- **#14 Git conventions** (process) — branches, Conventional Commits, smoke pre-merge gate in [`spark/agents/common/conventions.md#git-conventions`](../spark/agents/common/conventions.md#git-conventions).
- **#15 Small ops details** (product) — ky timeouts, Terminus health indicators, Nest env table, CLI/TUI config keys in the component READMEs listed under topic **#15**.
- **#16** Search / knowledge graph (product) — AGE + Typesense + api facade + worker sync + Cytoscape; ADR [`0004`](decisions/0004-search-knowledge-graph.md).

---

## Overview

### Product

| # | Topic | Hauptproblem | Spec | Impl | Spec targets |
|---|---|---|---|---|---|
| 1 | Schema / migrations | Spec | open | open | `tech-stack.md` + ADR + `packages/modules/README.md` |
| 3 | API contract conventions | Spec | open | open | `apps/api/README.md` (+ short pointer in `tech-stack.md`) |
| 4 | Worker / MCP / Web bundler | Spec | open | open | `tech-stack.md` inventory + app READMEs + ADRs |
| 5 | Better Auth wiring | Spec | **done** | open | `tech-stack.md` § Auth + modules + api-client + terminal + api README + ADR `0003` |
| 10 | Security / ops baseline | Spec | **done** | open | `apps/api/README.md` § Security / ops + pointers in `tech-stack.md` |
| 11 | Docker / Coolify image shape | Spec partial | partial | open | `tech-stack.md` § Coolify + per-app Deploy |
| 13 | Open version pins | Spec light | open | open | `tech-stack.md` inventory |
| 15 | Small ops details | Spec | **done** | open | api-client / modules / terminal / `.env.example` / api README |
| 16 | Search / knowledge graph | Spec | **done** | open | `architecture.md` + `tech-stack.md` + ADR `0004` + api/web/worker/mcp + `infra/postgres` + `infra/typesense` + `.env.example` |

### Process

| # | Topic | Hauptproblem | Spec | Impl | Spec targets |
|---|---|---|---|---|---|
| 2 | Build / emit | Impl | **done** | open | (scaffold note until wired) |
| 6 | Workflow “new resource” | Spec | **done** | partial | `spark/agents/common/conventions.md` + `apps/api/README.md` + pointers |
| 7 | Nest reference snippets | Spec | open | open | `apps/api/README.md` (+ optional `packages/modules`) |
| 8 | TypeScript / module contract | Spec | **done** | open | `tech-stack.md` § Module/compiler + `packages/config` |
| 9 | Root dependency rule | Spec | open | open | `tech-stack.md` § Monorepo + root `README.md` |
| 12 | ADRs / decisions (process) | Spec | open | n/a | `spec/decisions/NNNN-*.md` |
| 14 | Git conventions | Spec | **done** | optional | `spark/agents/common/conventions.md` (+ pointers in `AGENTS.md` / `README.md`) |

**Suggested order (spec work only)**

1. **Product:** 1 → 4 → **16** (with MCP access path) → 3+5 → 10, 11, 13, 15  
2. **Process:** 6+7 → 9 → **12** in parallel as product decisions land → **14** / **8** done → **2** implement  

---

# Product

Decisions about the running system: components, architecture, stack/versions, contracts, deploy shape.

## 1. Schema / migrations strategy

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec |
| **Spec status** | Spec open |
| **Impl status** | Impl open (after decisions) |
| **Spec targets** | [`tech-stack.md`](tech-stack.md) (Database / Drizzle); ADR `decisions/NNNN-schema-migrations.md`; short contract in [`packages/modules/README.md`](../packages/modules/README.md) § Database |

### Decide

- [ ] **define** Drizzle schema ownership: hand-written under `packages/modules` vs new generator stage (`schema.sql` → Drizzle TS) vs `drizzle-kit pull` against a DB bootstrapped from `schema.sql`
- [ ] **define** migration runner: `drizzle-kit migrate` (when: local script / Coolify pre-deploy / dedicated job) — **reject** prior-project runtime DDL in `onModuleInit()`
- [ ] **define** Better Auth table ownership: `@better-auth/cli generate` into Drizzle; coexistence with `spec/erd/schema.sql` (auth in SQL SoT vs generated-only vs both)
- [ ] **define** local vs QA/Prod migration path (same command surface?)

### Spec to write

- [ ] Document chosen pipeline in `tech-stack.md` (SoT → Drizzle → migrate)
- [ ] ADR with rejected alternatives (esp. runtime DDL)
- [ ] Update `packages/modules/README.md`: remove “Schema ownership TBD”; state folder layout + migrate command intent
- [ ] Note interaction with generators (`types` / `api` / `nest_dto` stay; optional new `drizzle` stage if chosen) — generator *usage* also appears under process **#6**

### Impl (later)

- [ ] Wire drizzle-kit config, migrations dir, package scripts
- [ ] Align Better Auth schema with chosen ownership
- [ ] Coolify / local docs for applying migrations

### Prior reference (rejected pattern — for ADR contrast only)

Prior project used **no** migration runner: DDL in `onModuleInit()` via `CREATE TABLE IF NOT EXISTS` + idempotent `ALTER TABLE … ADD COLUMN IF NOT EXISTS`. Schema lived at `packages/modules/src/database/schema.ts`; `DatabaseService` held domain query methods (no generic CRUD). **Do not adopt** runtime DDL — keep as rejected alternative in the ADR.

---

## 3. API contract conventions

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec |
| **Spec status** | Spec open |
| **Impl status** | Impl open |
| **Spec targets** | [`apps/api/README.md`](../apps/api/README.md) (primary); short pointer from [`tech-stack.md`](tech-stack.md) § Zod↔OpenAPI / Testing; ADR if error envelope contested |

### Decide

- [ ] **define** error JSON envelope (e.g. `{ error }` / `{ error, errors[] }` — adapt prior project, do not invent per-route shapes)
- [ ] **define** error-class → HTTP status table (`NotFound` → 404, `Validation` → 400/422, `Database` → 500, …) — **reject** `message.includes("not found")`
- [ ] **define** list contract: query (`page`/`limit`/max), response shape (bare array vs `{ items, total }`), sort/filter conventions
- [ ] **define** resource CRUD surface: methods/paths, `201`/`204`, ID format (UUID vs shortId), PATCH = partial Update (aligns with generator Update = Create.partial())
- [ ] **define** fixed infrastructure routes: `/health`, `/api/docs`, `/openapi.json` (or export-only) — stop “e.g.”

### Spec to write

- [ ] “HTTP contract” section in `apps/api/README.md` (envelope, status map, lists, CRUD, fixed routes)
- [ ] Exception filter behaviour references the status map
- [ ] One-line pointer in `tech-stack.md` to that section
- [ ] Optional ADR for envelope / 422 vs 400

### Impl (later)

- [ ] Global filter + OpenAPI examples matching the contract
- [ ] Shared list query DTO pattern; `tests/api` against the envelope

### Prior reference (adapt)

**Fixed routes (adopt as defaults unless decided otherwise):**

| Method | Path | Role |
|---|---|---|
| CRUD | `/resource`, `/resource/:id` | list / get / create / patch / delete |
| `GET` | `/health` | public health |
| `GET` | `/api/docs` | Swagger UI |
| `GET` | `/openapi.json` | OpenAPI document (also build-time export) |

**Error envelope (candidate):** filter normalizes to `{ error: "..." }` or `{ error: "...", errors: [...] }` — not `{ message }` only. Map via error classes / status table, **not** `message.includes("not found")`.

**List query DTO (candidate hand-written, not generated):**

```typescript
const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
export class ListQueryDto extends createZodDto(querySchema) {}
```

**neverthrow split (already in api README prose):** Service returns `ok`/`err`; Controller alone throws `HttpException` on `isErr()`.

**OpenAPI (prior):** Swagger UI `/api/docs`, JSON `/openapi.json`, API-key scheme documented, `cleanupOpenApiDoc()` on export.

---

## 4. Worker / MCP / Web bundler (empty inventory rows)

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec |
| **Spec status** | Spec open |
| **Impl status** | Impl open |
| **Spec targets** | Inventory + sections in [`tech-stack.md`](tech-stack.md); detail in `apps/worker|mcp|web/README.md`; ADR per contested choice |

### Decide — Worker

- [ ] **define** worker runtime (Nest standalone vs plain Node)
- [ ] **define** job model (Postgres-native queue e.g. pg-boss vs Nest `@nestjs/schedule` only vs other) — note: schedule alone is cron, not a job queue
- [ ] **define** worker `/health` contract (CLI/TUI already expect worker URLs)
- [ ] **define** whether worker exposes OpenAPI (second Orval input) or stays internal HTTP

### Decide — MCP

- [ ] **define** MCP SDK / framework
- [ ] **define** transport (stdio vs HTTP)
- [ ] **define** domain access path (**not** via `packages/api-client`) — direct Nest modules / services vs HTTP to api vs shared domain lib
- [ ] **define** logging surface (Service vs CLI rules — currently TBD in Logging table)

### Decide — Web

- [ ] **define** bundler (port `5173` in `.env.example` implies Vite — confirm)
- [ ] **define** Storybook framework adapter (`react-vite` etc.)
- [ ] **define** client data fetching / API usage (`api-client` + session/cookies vs other)
- [ ] **define** UI library baseline (none / shadcn / …) if template-relevant
- [x] **define** guided tours: [driver.js](https://github.com/nilbuild/driver.js) **1.9.0** — inventory in [`tech-stack.md`](tech-stack.md)

### Spec to write

- [ ] Fill inventory rows for Worker, MCP, Web bundler in `tech-stack.md`
- [ ] Short dedicated subsections (stack + boundaries)
- [ ] Update respective app READMEs with role + stack intent
- [ ] ADRs for queue choice, MCP access path, web bundler if contested

### Impl (later)

- [ ] Scaffold apps to match decisions; Dockerfiles; health endpoints; Storybook config

---

## 5. Better Auth wiring

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec |
| **Spec status** | Spec done — [`tech-stack.md` § Auth](tech-stack.md#auth-better-auth); ADR [`0003-better-auth`](decisions/0003-better-auth.md) |
| **Impl status** | Impl open |
| **Spec targets** | [`tech-stack.md`](tech-stack.md) § Auth; [`packages/modules/README.md`](../packages/modules/README.md) § Auth; [`packages/api-client/README.md`](../packages/api-client/README.md); [`apps/api/README.md`](../apps/api/README.md); [`packages/terminal/README.md`](../packages/terminal/README.md); ADR [`0003`](decisions/0003-better-auth.md) |

### Decide

- [x] **define** Nest integration style — hand-written Better Auth instance + global guard (**reject** community Nest module)
- [x] **define** Drizzle adapter + schema generation path — official Drizzle adapter; `@better-auth/cli` (depends on **#1**, closed)
- [x] **define** API key header name — freeze **`x-api-key`**
- [x] **define** web session flow — cookies; `WEB_ORIGIN` → CORS / `trustedOrigins`; `@Public()` for `/health`, auth routes, OpenAPI
- [x] **define** key lifecycle — issue/revoke via web settings (or authenticated CLI); store per-env in `@helloworld/terminal/config`

### Spec to write

- [x] Expand Auth section: adapter, header, session vs API-key parallel paths
- [x] Module contract in `packages/modules` (guard behaviour, `@Public()`)
- [x] Mutator auth contract in `packages/api-client` (header name, `configureClient`)
- [x] Env keys — Required/Default for `BETTER_AUTH_*` / `WEB_ORIGIN` in `apps/api/README.md` (broader env polish also **#15**)
- [x] ADR contrasting Better Auth vs static `API_KEY`
- [x] Terminal config: `apiKey` storage (not root `.env`)

### Impl (later)

- [ ] Auth module, guards, Better Auth routes, web client session, tool credential storage

### Prior reference (rejected — for ADR contrast)

Static env `API_KEY` + global `ApiKeyModule` checking header `x-api-key`, opt-out `@Public()`. **Rejected** in favour of Better Auth managed keys + sessions; header name **`x-api-key`** kept and frozen — see [`0003-better-auth.md`](decisions/0003-better-auth.md).

---

## 10. Security / ops baseline

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec |
| **Spec status** | Spec done — [`apps/api/README.md` § Security / ops](../apps/api/README.md#security--ops-baseline); pointers in [`tech-stack.md`](tech-stack.md#security--ops-baseline) |
| **Impl status** | Impl open |
| **Spec targets** | [`apps/api/README.md`](../apps/api/README.md) § Security / ops + Bootstrap; pointers in [`tech-stack.md`](tech-stack.md) § Security / ops, Coolify, Auth, Logging |

### Decide

- [x] **define** CORS policy — single `WEB_ORIGIN` in v1; multi-origin later (comma-separated / list) — do not overbuild
- [x] **define** Helmet — **yes** as Express template default (`helmet()` in bootstrap; **8.3.0**)
- [x] **define** request correlation — accept/generate **`x-request-id`**; Pino `requestId` + Problem Details `requestId`
- [x] **define** graceful shutdown — `app.enableShutdownHooks()` + Nest lifecycle (Coolify restarts; Drizzle pool cleanup)
- [x] **define** rate limiting — **out of template v1**; prefer Better Auth plugin limits later (optional `@nestjs/throttler` on API-key routes only if needed)

### Spec to write

- [x] Ops/security checklist in `apps/api/README.md`
- [x] Cross-link Auth + Coolify sections
- [x] Secrets logging rules already present — keep; ensure filter never leaks tokens
- [x] Short pointers in `tech-stack.md` (Security / ops + Coolify / Auth / Logging)
- [x] Bootstrap sketch updated (Helmet, CORS, shutdown, request-id bindings)

### Impl (later)

- [ ] Wire CORS, helmet, request-id middleware, shutdown hooks (no Nest throttle required for v1)

---

## 11. Docker / Coolify image shape

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec partial |
| **Spec status** | Partial — multi-stage intent + `dist/` runtime in Coolify / Build emit |
| **Impl status** | Impl open |
| **Spec targets** | [`tech-stack.md`](tech-stack.md) § Coolify; per-app README Deploy sections |

Runtime/deploy shape of the product (how each service ships). Build *tooling* details also touch process **#2**.

### Decide

- [ ] **define** monorepo install strategy in images: `turbo prune --docker` vs `pnpm deploy --filter` vs full-root install
- [ ] **define** base image (Node 26 alpine vs distroless-style)
- [ ] **define** whether `HEALTHCHECK` is required in Dockerfiles (vs Coolify health hitting `/health`)
- [ ] **define** non-root user name/UID convention

### Spec to write

- [ ] Concrete stage contract (see prior reference below); adapt filter name `@helloworld/…`, paths `apps/api`, etc.
- [ ] Per-app Deploy blurb points at shared contract

### Impl (later)

- [ ] Add `apps/*/Dockerfile` for each Coolify app

### Prior reference (adapt)

Multi-stage, build context = monorepo root:

1. **installer** — copy lockfile + workspace `package.json` first → `pnpm install --frozen-lockfile` (layer cache)
2. **builder** — `pnpm run build --filter <api-package>` (needs `^build` / Turbo so `packages/*` emit `dist/`)
3. **production** — `node:26-alpine`, non-root user, expose app port, run built JS only

```dockerfile
FROM node:26-alpine AS production
WORKDIR /app/apps/api
USER nodeapp
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## 13. Open version pins

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec light |
| **Spec status** | Spec open (“pin when wiring”) |
| **Impl status** | Impl open |
| **Spec targets** | [`tech-stack.md`](tech-stack.md) inventory (+ Nest packages table) |

### Decide

- [ ] **define** exact versions (or “latest as of DATE” then pin): `nestjs-zod`, `postgres` (postgres.js), `@nestjs/terminus`, `pino-pretty`, `unplugin-swc` (if used)
- [ ] **define** Node pin mechanism: `.nvmrc` and/or `engines` field (inventory already notes local 26.7.0)

### Spec to write

- [ ] Fill Version column cells currently blank / “(pin when wiring)”
- [ ] Keep “as of 2026-10-01” policy or bump the as-of date when refreshing

### Impl (later)

- [ ] Lockfile pins when packages are added

---

## 15. Small ops details (timeouts, health, env table)

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec |
| **Spec status** | Spec done — timeouts / health / env table / config keys in component READMEs |
| **Impl status** | Impl open |
| **Spec targets** | Timeouts → [`packages/api-client/README.md`](../packages/api-client/README.md#timeouts-normative); Health → [`packages/modules/README.md`](../packages/modules/README.md#health-normative); Env → [`.env.example`](../.env.example) + [`apps/api/README.md`](../apps/api/README.md#nest-facing-env-table-normative); Config keys → [`packages/terminal/README.md`](../packages/terminal/README.md#config-keys-normative) |

### Decide

- [x] **define** ky timeouts — **adopt** 30s general / 3s health
- [x] **define** `/health` indicators — Terminus **DB ping** + process up; **no** memory metrics in v1
- [x] **define** per-key Required / Default / Description table for Nest-facing env — mirror `.env.example`; `LOG_LEVEL` default **`info`**; Better Auth secrets required; **no** static `API_KEY`
- [x] **define** CLI/TUI config key names — freeze `apiUrl`, `workerUrl`, `apiKey` in `@helloworld/terminal/config` Zod schema

### Spec to write

- [x] Document timeouts in api-client mutator contract
- [x] Health module contract: exact checks + `@Public()`
- [x] Env table in `apps/api/README.md` (Required/Default/Description); keep single root `.env` rule
- [x] `envSchema` example snippet in api README (Better Auth keys, not `API_KEY`)
- [x] Frozen config keys in `packages/terminal/README.md`

### Impl (later)

- [ ] Mutator timeouts, Terminus indicators, Zod `envSchema` matching the table
- [ ] Wire `@helloworld/terminal/config` schema to the frozen keys

### Prior reference (adapt) — decisions landed above

**ky:** general timeout **30s**; health checks **3s**.

**TUI config globals:** `pollInterval` default 30 (range 5–300); `pageSize` default 15 (range 5–100). Resolve URL/key: active environment → built-in defaults; missing file → defaults; corrupt file → hard error.

**Env:** see normative table in `apps/api/README.md` — no static `API_KEY`; `LOG_LEVEL` default **`info`**.

---

## 16. Search / knowledge-graph service

Secondary indexes (graph + search) over domain entities — complements Postgres SoT. **No** public `apps/graph`. Issue: [#12](https://github.com/einmalik1/helloworld/issues/12).

| | |
|---|---|
| **Lane** | Product |
| **Hauptproblem** | Spec |
| **Spec status** | Spec done — [`architecture.md`](architecture.md#search--knowledge-graph-secondary-indexes); [`tech-stack.md`](tech-stack.md#search--knowledge-graph); ADR [`0004`](decisions/0004-search-knowledge-graph.md) |
| **Impl status** | Impl open |
| **Spec targets** | architecture + tech-stack + ADR `0004` + api/web/worker/mcp READMEs + `infra/postgres` + `infra/typesense` + `.env.example` |

### Decide — placement

- [x] **define** component path — **no** `apps/graph`; AGE on Postgres; Typesense under `infra/typesense`; facade on `apps/api`
- [x] **define** role vs Postgres — secondary indexes; Postgres remains SoT; writes API → DB first
- [x] **define** domain projection — person / channel / greeting / reaction nodes + authored / posted_in / reacted_to / reaction_on edges (ADR `0004`)
- [x] **define** sync model — worker transactional outbox + schedule drain + rebuild job; **not** sync-on-write

### Decide — engine / stack

- [x] **define** engines — **Apache AGE** (graph) + **Typesense** (search)
- [x] **define** product query style — structured retrieve/search API only (`/graph/related`, `/graph/subgraph`, `/search`)
- [x] **define** search scope v1 — full-text / typo-tolerant; vector deferred

### Decide — access path (how clients reach it)

- [x] **define** primary access — **only via `apps/api`** facade; MCP tools call api; CLI/TUI/web via api / api-client
- [x] **define** no direct engine URLs for clients
- [x] **define** auth — Better Auth on api; AGE/Typesense network-internal (api/worker S2S)
- [x] **define** MCP path — HTTP → api retrieve/search only (aligns with **#4**)

### Decide — ops

- [x] **define** local Compose — `infra/postgres` (AGE image) + `infra/typesense`; Coolify pin same Postgres image + Typesense service
- [x] **define** `/health` — api probes Typesense; AGE covered by Postgres DB ping (no separate graph-app health)
- [x] **define** root `.env` — `TYPESENSE_*`; AGE via `DATABASE_URL` + extension bootstrap

### Spec to write

- [x] Component boundaries in [`architecture.md`](architecture.md)
- [x] Inventory + subsection in [`tech-stack.md`](tech-stack.md)
- [x] No new public app README — intents in api/web/worker/mcp + infra READMEs
- [x] ADR [`0004-search-knowledge-graph.md`](decisions/0004-search-knowledge-graph.md)
- [ ] Optional feature stub under `spec/features/` when product behaviour needs acceptance criteria
- [ ] Root [`README.md`](../README.md) Components/Layout touch-up when infra compose aliases land (impl-adjacent)
- [x] Coolify / local data-service rows updated for AGE Postgres + Typesense
- [x] MCP README retrieve/search-only intent

### Impl (later)

- [ ] AGE custom image, Typesense Compose/Coolify, outbox + projection jobs, api facade routes, Cytoscape explorer, health probe, tests

---

# Process

Decisions about how we develop, document, generate, and change the system.

## 2. Build / emit contract

| | |
|---|---|
| **Lane** | Process |
| **Hauptproblem** | Impl (spec done) |
| **Spec status** | Spec done — [`tech-stack.md#build--emit-contract`](tech-stack.md#build--emit-contract) |
| **Impl status** | Impl open |
| **Spec targets** | — (remove scaffold note when wired); Web bundler still TBD under product **#4** |

### Decide

- [ ] (none for emit itself — already decided: `tsc`/`nest build` → `dist/`, consumers import built JS)
- [ ] Web bundler choice tracked under product **#4**

### Spec to write

- [ ] After wiring: delete temporary “exports may still point at `./src`” note in Build / emit section

### Impl (later)

- [ ] Per-package `build` scripts; flip `package.json` `exports` to `./dist/…`
- [ ] Wire `turbo.json` (`build` `dependsOn: ["^build"]`, `outputs: ["dist/**"]`, app outs)
- [ ] Nest: `@nestjs/cli`, `nest-cli.json`, `nest build` / `nest start --watch`
- [ ] Docker runtime stages consume `dist/` only

### Prior reference (adapt)

`turbo.json` task sketch (align with intent already in `tech-stack.md`):

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "dev": { "dependsOn": ["^build"], "cache": false, "persistent": true },
    "test": { "dependsOn": ["build"] },
    "lint": {},
    "typecheck": {},
    "format": { "cache": false }
  }
}
```

App scripts (prior): `"build": "nest build"`, `"dev": "nest start --watch"`, `"typecheck": "tsc --noEmit"`. Tools: plain `tsc` (no Nest CLI).

---

## 6. Workflow “new resource”

| | |
|---|---|
| **Lane** | Process |
| **Hauptproblem** | Spec |
| **Spec status** | Spec done — [`spark/agents/common/conventions.md` § New resource](../spark/agents/common/conventions.md#new-resource-workflow); Nest mirror [`apps/api/README.md`](../apps/api/README.md#feature--new-resource-workflow); pointers in [`tech-stack.md`](tech-stack.md#schema-generators-sparkgenerators) + [`AGENTS.md`](../AGENTS.md) |
| **Impl status** | Partial (generators exist; Nest/DB/client wiring incomplete) |
| **Spec targets** | [`spark/agents/common/conventions.md`](../spark/agents/common/conventions.md#new-resource-workflow) (primary); [`apps/api/README.md`](../apps/api/README.md#feature--new-resource-workflow); pointer from [`tech-stack.md`](tech-stack.md) § Schema generators; [`AGENTS.md`](../AGENTS.md) |

Depends on product **#1** (migrations) for the migrate step — **#1** closed; migrate via `drizzle-kit migrate` / `pnpm db:migrate` intent.

### Decide

- [x] **define** canonical step order and ownership (who edits SQL vs who runs generate vs who writes queries)
- [x] **define** what is generated vs hand-written (DTO wrappers generated; services/controllers hand; Drizzle queries per **#1**)

### Spec to write

- [x] Checklist (agent-ready) in `spark/agents/common/conventions.md`:
  1. Edit `spec/erd/schema.sql` (+ profile categories if needed)
  2. `pnpm generate` (core → types → api → nest_dto + drizzle)
  3. Migration / Drizzle schema update (**#1**)
  4. `DatabaseService` domain methods
  5. Feature module (controller/service) + `AppModule` import
  6. `openapi:export` → `pnpm generate:client`
  7. Unit + `tests/api`
  8. Optional: CLI command / TUI surface
- [x] Nest-focused mirror in `apps/api/README.md`
- [x] Link checklist from generators section, `AGENTS.md`, and Database / Drizzle note

### Impl (later)

- [ ] Ensure each step has a real command; keep README in sync

### Prior reference (adapt)

Prior “new feature” steps (pre-generator era — merge with generate pipeline above):

1. Zod schemas in `packages/types` (or dto/) — today: prefer `schema.sql` → `pnpm generate`
2. Drizzle schema in `packages/modules`
3. `DatabaseService` methods
4. Feature module: `.module` / `.controller` / `.service`
5. Import in `AppModule`
6. Tests under app test folder

Prior blueprint also had a greenfield monorepo checklist (config → types → modules → nest app → patterns → turbo) — useful only if scaffolding a *new* repo from this template; keep as optional spark/agent note later.

---

## 7. Nest reference snippets

| | |
|---|---|
| **Lane** | Process |
| **Hauptproblem** | Spec |
| **Spec status** | Spec open (patterns exist as prose only) |
| **Impl status** | Impl open |
| **Spec targets** | [`apps/api/README.md`](../apps/api/README.md) § NestJS conventions; optional bootstrap helper notes in [`packages/modules/README.md`](../packages/modules/README.md) |

Coding conventions / scaffolding patterns (how we implement Nest). Product contracts they implement (error map, auth) live under **#3** / **#5**.

### Decide

- [ ] **define** which snippets are normative for the template (must match when scaffolding)
- [ ] **define** LoggerModule defaults: `autoLogging: false` (or filter `/health`); pino-pretty `singleLine` when not production — confirm as template default
- [ ] **define** global `ZodValidationPipe` only (no per-route duplicate pipes as the default pattern — reject prior-project redundancy)

### Spec to write

- [ ] Code sketches in `apps/api/README.md` for:
  - [ ] `main.ts` bootstrap (logger, pipes, filter, `setupOpenApi`)
  - [ ] `AppModule` import order (config → auth → database → health → logger → features)
  - [ ] Service `Result` + Controller `HttpException` mapping
  - [ ] Exception filter outline (status map from **#3**)
  - [ ] Vitest `Test.createTestingModule` + `overrideGuard`
- [ ] Use Nest 12 / Better Auth / generated DTOs (not static `ApiKeyModule` / Nest 11 copy-paste)
- [ ] Package name: `nestjs-pino` (not `pino-nestjs`)

### Impl (later)

- [ ] Scaffold real files from those sketches

### Prior reference (adapt — Nest 12 / Better Auth / helloworld names)

**`main.ts` sketch:**

```typescript
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  setupOpenApi(app, { title: "Hello World API", description: "REST API" });
  const configService = app.get(ConfigService<AppConfig, true>);
  const port = configService.get("API_PORT", { infer: true });
  await app.listen(port);
}
```

**`LoggerModule.forRoot` sketch:**

```typescript
LoggerModule.forRoot({
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? "info",
    autoLogging: false,
    transport: process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { singleLine: true } }
      : undefined,
  },
});
```

**`AppModule` import order (replace `ApiKeyModule` with Better Auth module):**

```typescript
@Module({
  imports: [
    createAppConfigModule({ envSchema }),
    // AuthModule — Better Auth session + API-key guard (not static ApiKeyModule)
    DatabaseModule,
    HealthModule,
    LoggerModule.forRoot({ /* pino above */ }),
    // Feature modules…
  ],
})
export class AppModule {}
```

**Service / controller Result mapping:**

```typescript
// Service
async findAll(): Promise<Result<Entity[], DatabaseError>> {
  try { /* ... */ return ok(entities); }
  catch (e) { return err(new DatabaseError(e)); }
}

// Controller
const result = await this.service.findAll();
if (result.isErr()) throw new HttpException({ error: String(result.error) }, /* status from map */);
return result.value;
```

**Exception filter intent:** `@Catch(HttpException)` → `response.status(status).json(body)` with envelope from **#3**.

**Vitest module test sketch** (override auth guard, not `ApiKeyGuard` name forever):

```typescript
const moduleRef = await Test.createTestingModule({
  imports: [/* test config */],
  controllers: [ResourceController],
  providers: [{ provide: ResourceService, useValue: mockService }],
})
  .overrideGuard(/* AuthGuard */)
  .useValue({ canActivate: () => true })
  .compile();
```

**Layout rule (already in api README):** multiple files → subfolder; single service may sit at feature root. Optional external sync tree: `src/{feature}/sync/` + `{provider}/`.

**Do not** add per-route `@UsePipes(new ZodValidationPipe(Dto))` as the default when a global pipe exists.

---

## 8. TypeScript / module contract

| | |
|---|---|
| **Lane** | Process |
| **Hauptproblem** | Spec |
| **Spec status** | Spec done — [`tech-stack.md` § Module / compiler](tech-stack.md#module--compiler-rules-all-ts-workspaces); [`packages/config/README.md`](../packages/config/README.md) |
| **Impl status** | Impl open |
| **Spec targets** | [`tech-stack.md`](tech-stack.md) § Module / compiler rules; [`packages/config/README.md`](../packages/config/README.md) |

### Decide

- [x] **define** `compilerOptions.target` — **ES2024** (TS 7 + Node 26); fallback **ES2023** if Nest DI / emit spike fails (document in `packages/config`)
- [x] **define** SWC role — **Vitest only** via `unplugin-swc` **2.0.0**; Nest emit stays `nest build` / `tsc`
- [x] **define** Nest DI / metadata — early spike under TS 7; if `emitDecoratorMetadata` fails, document metadata owner (Nest compiler / SWC) in `packages/config/README.md`

### Spec to write

- [x] Fill gaps in Module / compiler rules (target, SWC, DI spike)
- [x] `packages/config` README: what `tsconfig.base.json` / vitest base guarantee + spike / workaround note
- [x] Testing row: pin `unplugin-swc` as Vitest-only (not Nest emit)

### Impl (later)

- [ ] Land `tsconfig.base.json`, vitest SWC (`unplugin-swc`)
- [ ] Nest DI smoke under TS 7; if red, apply fallback target / metadata-owner note in `packages/config/README.md`

### Prior reference (adapt — decisions landed above)

- Target **ES2024** (was ES2023 in prior); `moduleResolution` `nodenext`; relative imports with `.js` suffix; `"type": "module"`
- Nest: `experimentalDecorators` + `emitDecoratorMetadata`; emit via Nest/`tsc`
- Vitest: `unplugin-swc` for decorator support in tests only
- Shared bases in `packages/config`: `tsconfig.base.json`, `vitest.config.ts`, `oxlintrc.json`

---

## 9. Root dependency rule

| | |
|---|---|
| **Lane** | Process |
| **Hauptproblem** | Spec |
| **Spec status** | Spec open |
| **Impl status** | Impl open |
| **Spec targets** | [`tech-stack.md`](tech-stack.md) § Monorepo; root [`README.md`](../README.md) |

### Decide

- [ ] **define** what may live in root `package.json` dependencies/devDependencies (e.g. only `turbo` + workspace-wide quality tools: oxlint, oxfmt, typescript?) vs “root only turbo” (prior project)
- [ ] **define** where generators’ Python deps live (already outside npm — document)

### Spec to write

- [ ] Explicit rule: new libraries belong in the consuming workspace; root is orchestration + shared tooling only
- [ ] Align root README Scripts / Environment with that rule

### Impl (later)

- [ ] Add missing root tooling deps / scripts (`dev`, `build`, `lint`, `format`, `test`, `docker:local:*`) when wiring Turbo

### Prior reference (adapt)

Prior rule: root `package.json` contains **only `turbo`** as a dependency; new libraries belong in the consuming workspace. Decide whether helloworld also allows root-level oxlint/oxfmt/typescript as shared tooling (see Decide above).

Filter usage: `pnpm run --filter <pkg> …` / `pnpm add <pkg> --filter <pkg>` from repo root.

---

## 12. ADRs / decisions (recording process)

| | |
|---|---|
| **Lane** | Process |
| **Hauptproblem** | Spec |
| **Spec status** | Spec open (`decisions/` empty aside from README) |
| **Impl status** | n/a |
| **Spec targets** | [`decisions/NNNN-short-title.md`](decisions/) |

This topic is the **process** of writing ADRs (naming, structure, when). Candidate ADR *subjects* below are mostly **product** decisions — write them when those product topics are decided.

### Decide / write (process)

- [ ] **define** when an ADR is required (contested product choice vs every inventory row)
- [ ] **define** naming + template: `NNNN-short-title.md` per [`decisions/README.md`](decisions/README.md)
- [ ] **define** rule: `tech-stack.md` stays factual; “why” lives in ADRs

### Product ADR candidates (content — land with product topics)

- [ ] ADR: two binaries (`helloworld` / `helloworld-tui`) vs dual-mode single binary
- [x] ADR: Better Auth (sessions + managed API keys) vs static env `API_KEY` module — [`0003-better-auth.md`](decisions/0003-better-auth.md)
- [ ] ADR: CLI/TUI logging via tslog+ora (`packages/terminal`) vs Pino in tools
- [ ] ADR: Orval + ky mutator vs hand-written HTTP client
- [ ] ADR: Coolify build-from-Git (Dockerfile pack) vs registry pull-only default
- [ ] ADR: package emit to `dist/` (rationale for process **#2**)
- [ ] ADR: Garage (QA/Prod) + local MinIO-compatible stand-in
- [x] ADR: search / knowledge-graph service (engine + access path) — [`0004-search-knowledge-graph.md`](decisions/0004-search-knowledge-graph.md)
- [ ] Plus ADRs from **#1**, **#3**, **#4** as those decisions land

### Spec to write

- [ ] Short process note (when/where/how) in `decisions/README.md` or spark common
- [ ] Each product ADR: context, decision, consequences, rejected alternatives

---

## 14. Git conventions

| | |
|---|---|
| **Lane** | Process |
| **Hauptproblem** | Spec |
| **Spec status** | Spec done — [`spark/agents/common/conventions.md#git-conventions`](../spark/agents/common/conventions.md#git-conventions); pointers in [`AGENTS.md`](../AGENTS.md) + root [`README.md`](../README.md) |
| **Impl status** | Optional (hooks / CI) |
| **Spec targets** | Process home: `spark/agents/common/conventions.md` — **not** inside `tech-stack.md` inventory |

### Decide

- [x] **define** branch naming (`feature/*`, `fix/*`, `chore/*`) — **adopt**
- [x] **define** commit convention (Conventional Commits) — **adopt**
- [x] **define** pre-merge quality gate: `format` → `lint` → `typecheck` → **smoke** (+ `build` where relevant) — **not** the full test suite

### Spec to write

- [x] Short process note for humans/agents in `spark/agents/common/conventions.md`
- [x] Link from `AGENTS.md` / root `README.md`

### Impl (later)

- [ ] Optional husky/lefthook / CI workflow matching the gate

### Prior reference (adapt)

- Branches: `feature/*`, `fix/*`, `chore/*`
- Commits: Conventional Commits
- Pre-merge: `format` → `lint` → `typecheck` → **smoke** (full suite = CI / deeper verification)

---

# Appendix

## Rejected prior-project patterns (do not port)

| Prior pattern | Why not |
|---|---|
| Dual-mode single binary CLI/TUI (`argv.length` → Ink vs Commander) | Template: two installable tools (`helloworld` / `helloworld-tui`) |
| Static env `API_KEY` / `ApiKeyModule` | Better Auth managed keys + sessions |
| Runtime DDL in `onModuleInit()` | Prefer real migrations (**#1**) |
| Status via `message.includes("not found")` | Explicit error-class → status map (**#3**) |
| `LOG_LEVEL` default `warn` | Template default `info` |
| Silent migration of flat legacy CLI configs | Greenfield template — hard error on corrupt config is enough |
| Product command/keybinding encyclopedia (meetings, Confluence, …) | Keep CLI/TUI READMEs structural |
| Older pins (Nest 11, pnpm 11, TS 5.7, Vitest 4, ky 1.x, …) | Use [`tech-stack.md`](tech-stack.md) inventory |

CLI/TUI structural intent (separate binaries, XDG config, Commander vs Ink boundaries) already lives in [`tools/cli/README.md`](../tools/cli/README.md) and [`tools/tui/README.md`](../tools/tui/README.md) — no need to keep the foreign doc for that.

---

## Progress log

| Date | Change |
|---|---|
| 2026-10-04 | Backlog created from chat analysis; #2 marked Spec done |
| 2026-10-04 | Added **#16** Search / knowledge-graph service (new app; access via REST / MCP / facade TBD) |
| 2026-10-04 | Restructured into **Product** vs **Process** chapters; topic numbers kept for cross-links |
| 2026-10-04 | Salvaged prior-project snippets into topic *Prior reference* sections; removed root foreign `TECH-STACK.md` |
| 2026-10-09 | **#14** Git conventions Spec done — process note + smoke gate; tracking closed |
| 2026-10-09 | **#15** Small ops details Spec done — ky 30s/3s, Terminus DB+up, Nest env table, terminal `apiUrl`/`workerUrl`/`apiKey` |
| 2026-10-09 | **#10** Security / ops baseline Spec done — api README checklist + tech-stack pointers (CORS, Helmet, request-id, shutdown, rate-limit out of v1) |
| 2026-10-09 | **#5** Better Auth wiring Spec done — inventory, module/mutator/env/terminal contracts, ADR `0003` |
| 2026-10-09 | **#6** Workflow “new resource” Spec done — conventions checklist + api README mirror + tech-stack / AGENTS pointers |
| 2026-10-09 | **#8** TypeScript / module contract Spec done — ES2024 target, SWC Vitest-only, Nest DI spike / workaround in config README |
| 2026-10-09 | **#16** Search / knowledge graph Spec done — AGE + Typesense + api facade + worker outbox + Cytoscape; ADR `0004` |
