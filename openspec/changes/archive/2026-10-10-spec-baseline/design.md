# Design

## Context

See `proposal.md`. Existing main specs cover foundation only (`monorepo-tooling`, `build-emit`, `local-dev-runtime`, `platform-client`, `coolify-test-env`). Product intent exists in `spec/` and `tech-stack-todo.md` but decisions are open. Multi-agent delivery needs frozen capabilities + a named change backlog.

## Goals / Non-Goals

**Goals:**

- Lock default decisions for open product topics so agents do not re-debate.
- Materialize OpenSpec capabilities (deltas in this change).
- Write ADRs + update architecture/tech-stack/feature pointers.
- Publish `spark/plans/active/implementation-backlog.md` with Waves A–C.

**Non-Goals:**

- Implementing Nest/domain/worker code.
- Final search engine pin if evaluation is needed — record shortlist + facade rules; pick default for template in ADR with “revisit OK”.
- Coolify app deploy (Dockerfiles still missing).

## Decisions (defaults locked by this baseline)

| Topic | Default | Rejected |
|---|---|---|
| Migrations | `schema.sql` SoT → Drizzle schema (generate or hand-sync documented) → `drizzle-kit migrate` | Runtime DDL in `onModuleInit` |
| HTTP errors | `{ error }` (+ optional `errors[]`); class→status map; validation 422 | `message.includes("not found")` |
| Lists/CRUD | `page`/`limit`; UUID ids; `201` create; `204` delete; PATCH partial | Per-route inventiveness |
| Auth | Better Auth sessions + managed API keys | Static env `API_KEY` module |
| Domain access | `@helloworld/platform` in-process for API + MCP | MCP via `api-client`; clients→engines direct |
| Worker queue | pg-boss on Postgres | Redis-required queue for template |
| Worker runtime | Nest standalone (same Nest major as API) | Undocumented one-off Node script as only option |
| Object storage | Garage Coolify / MinIO local; S3 SDK behind platform | Per-client S3 credentials |
| Impex | Async API `202` + worker + S3 (existing feature doc) | Sync-only large exports as default |
| Web bundler | Vite (matches `.env.example` port 5173) | Leave inventory blank |
| Search/graph access | API + MCP + platform only; Postgres SoT | Direct engine URLs for web/CLI |
| Search/graph engine | **Template default candidate: Apache AGE on Postgres** (ops-light) OR Memgraph if AGE unfit — ADR picks one at apply time after short check; facade unchanged | Requiring Redis+ES+Neo4j all at once for v1 |
| MCP transport | stdio for local agents; HTTP optional later | DB access from MCP |
| Multi-agent test | Coolify `test` env | Host Compose from Orca on Coolify server |

## Implementation backlog (for agents after archive)

```text
Wave A (parallel after baseline archived)
  implement-schema-migrations
  implement-nest-modules-core
  implement-api-http-contract   # may merge with api scaffold

Wave B (parallel after Wave A)
  implement-auth-better-auth
  implement-domain-person
  implement-domain-channel
  implement-domain-greeting
  implement-domain-greeting-reaction

Wave C (parallel after API CRUD exists)
  implement-object-storage-adapter
  implement-worker-jobs
  implement-impex
  implement-mcp-tools
  implement-web-vite-shell      # thin client
  implement-search-knowledge-graph  # after #16 ADR engine pin
```

Each backlog item becomes its own OpenSpec change (`/opsx-propose <name>`) with tasks sized for one agent + one PR.

## Risks / Trade-offs

- **[Risk] Spec baseline too large to apply in one sitting** → Mitigation: tasks are doc/ADR/backlog only; parallelizable among doc writers if needed.
- **[Risk] Engine default wrong** → Mitigation: facade locked; engine ADR explicitly revisitable.
- **[Risk] Agents start impl before baseline archived** → Mitigation: backlog file says “blocked on archive of spec-baseline”.

## Open Questions

- Exact AGE vs Memgraph pick — resolve during apply task for ADR #16 with a short spike note, not in proposal debate.
- Whether list responses are bare arrays vs `{ items, total }` — default **`{ items, total }`** in ADR for api-http-contract unless apply finds generator conflict.
