# Tasks

## 1. Decision records (ADRs)

- [x] 1.1 Add `spec/decisions/0001-schema-migrations.md` locking drizzle-kit migrate + schema.sql SoT; reject runtime DDL — verify file exists and states rejected alternative
- [x] 1.2 Add `spec/decisions/0002-api-http-contract.md` locking envelope `{ error }`, status map, `{ items, total }` lists, UUID CRUD, fixed routes — verify file exists
- [x] 1.3 Add `spec/decisions/0003-better-auth.md` locking sessions + managed API keys; reject static env API_KEY — verify file exists
- [x] 1.4 Add `spec/decisions/0004-platform-facade-mcp.md` locking API+MCP → platform in-process; clients use api-client only — verify file exists
- [x] 1.5 Add `spec/decisions/0005-worker-pg-boss.md` locking pg-boss on Postgres + Nest worker — verify file exists
- [x] 1.6 Add `spec/decisions/0006-search-knowledge-graph.md` locking Postgres SoT, access via API/MCP/platform only, and a concrete engine default (AGE or Memgraph after short note) — verify file exists

## 2. Product doc alignment

- [x] 2.1 Update `spec/architecture.md` with platform facade, worker, MCP, object storage, and search/graph as secondary index — verify those components are named
- [x] 2.2 Update `spec/tech-stack.md` inventory rows for worker (pg-boss/Nest), MCP (platform path), web (Vite), and pointer to search/graph ADR — verify inventory no longer blank for worker/MCP/web bundler
- [x] 2.3 Update `packages/modules/README.md` database section: remove “Schema ownership TBD”; point at ADR 0001 — verify “TBD” gone
- [x] 2.4 Add or expand `spec/features/` stubs for person, channel, greeting, greeting-reaction linking to ERD + OpenSpec capability ids — verify four feature files or a catalog table listing them
- [x] 2.5 Ensure `spec/features/impex.md` cross-links OpenSpec capability `impex` / worker / object-storage — verify links present
- [x] 2.6 Mark closed Decide checkboxes in `spec/tech-stack-todo.md` for topics locked by ADRs (or add a “Closed by spec-baseline” section) — verify #1/#3/#5/#4 access/#16 access path show closed

## 3. Multi-agent backlog

- [x] 3.1 Write `spark/plans/active/implementation-backlog.md` with Waves A–C and change names from design.md — verify Wave A–C headings and at least ten named future changes
- [x] 3.2 Add short pointer from `spark/README.md` or `agents.md` to that backlog for agents — verify link exists
- [x] 3.3 Add `spark/agents/common/` note: one agent → one backlog change → `/opsx-propose` if missing → `/opsx-apply`; no new Explore for frozen facade — verify file or section exists

## 4. App README pointers

- [x] 4.1 Update `apps/api/README.md` with HTTP contract pointer to ADR 0002 / OpenSpec `api-http-contract` — verify section exists
- [x] 4.2 Update `apps/mcp/README.md` with platform in-process rule — verify stated
- [x] 4.3 Update `apps/worker/README.md` with pg-boss intent — verify stated
- [x] 4.4 Update `apps/web/README.md` with Vite intent — verify stated

## 5. Validation

- [x] 5.1 Run `openspec validate spec-baseline` and fix any issues — verify command exits 0
- [x] 5.2 Confirm all capability delta specs listed in proposal exist under `openspec/changes/spec-baseline/specs/` — verify count matches proposal (13 capabilities)

## Workflow follow-up

- Archive with `/opsx-archive` after apply completes (syncs capabilities into `openspec/specs/`).
- Then agents: `/opsx-propose` / `/opsx-apply` per backlog change in Wave order.
