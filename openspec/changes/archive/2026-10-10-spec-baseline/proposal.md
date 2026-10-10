# Proposal

## Why

Foundation (tooling, platform package, Coolify test) is done, but product behaviour still lives as scattered README/`tech-stack-todo` open decisions — not as OpenSpec capabilities agents can implement in parallel. Continuing idea → mini-change loops will not scale. This change freezes the product baseline as OpenSpec specs, locks default decisions where evidence exists, and publishes an implementation backlog of named changes for multi-agent work.

## What Changes

- Add OpenSpec **capabilities** covering schema/migrations, HTTP contract, auth, Nest modules, worker jobs, MCP, object storage, impex, Hello World domain entities, and search/knowledge-graph access rules.
- Record **decision defaults** (ADRs + tech-stack/architecture updates) for contested items from `spec/tech-stack-todo.md` (#1, #3, #4, #5, #16 access path, etc.).
- Publish an **implementation backlog** (named changes + dependency waves) under `spark/plans/` so agents pick `/opsx-propose` / `/opsx-apply` tickets without new Explore loops.
- **No application feature implementation** in this change (no Nest CRUD, no Dockerfiles beyond docs). Spec and backlog only.

## Capabilities

### New Capabilities

- `schema-migrations`: DDL SoT → Drizzle → migrate runner; reject runtime DDL.
- `api-http-contract`: Error envelope, status map, list/CRUD shapes, fixed routes (`/health`, docs, OpenAPI).
- `auth-better-auth`: Sessions (web) + managed API keys (CLI/TUI/machines); `@Public()` for health.
- `nest-modules-core`: Shared Nest infra surface in `@helloworld/modules` (config, db, health, auth, openapi) wrapping platform where needed.
- `worker-jobs`: Background job execution (pg-boss on Postgres), worker health/job HTTP for operators.
- `mcp-tools`: MCP access to domain via `@helloworld/platform` in-process (not `api-client`).
- `object-storage`: S3-compatible file storage contract for apps (Garage in Coolify; MinIO local).
- `impex`: Generic import/export via API + worker + object storage (promote existing feature intent).
- `domain-person`: Person resource behaviour (CRUD via API/platform).
- `domain-channel`: Channel resource behaviour.
- `domain-greeting`: Greeting resource behaviour.
- `domain-greeting-reaction`: Greeting reaction resource behaviour.
- `search-knowledge-graph`: Secondary search/graph index; Postgres remains SoT; clients only via API/MCP/platform.

### Modified Capabilities

- (none — existing main specs stay foundation-only)

## Impact

- **Docs:** `spec/decisions/*`, `spec/architecture.md`, `spec/tech-stack.md`, `spec/features/*`, `apps/*/README.md` pointers, `spark/plans/…` backlog.
- **OpenSpec:** many new `openspec/specs/*` after archive.
- **Unlocks:** Parallel agent waves on the backlog changes without re-litigating architecture each time.
- **Does not:** Ship running API/domain code; does not provision new Coolify apps.
