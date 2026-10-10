# Implementation backlog (multi-agent)

**Baseline:** `spec-baseline` (archived) archived — capabilities live under `openspec/specs/`.

Agents: **one agent → one change** from this list. If the change folder does not exist yet, run `/opsx-propose <name>` then `/opsx-apply`. Do **not** re-open facade decisions (ADRs 0001–0006) via Explore.

Target test plane: Coolify **test** in `spark/repo-profile.yaml` (not host `docker:local:up` on the Coolify server).

## Wave A — foundation services (parallel)

| Change name | Focus | Depends on |
|---|---|---|
| `implement-schema-migrations` | drizzle-kit, migrate scripts, Better Auth tables path | baseline archived |
| `implement-nest-modules-core` | config/db/health/auth/openapi modules wiring | schema-migrations (or tightly coordinated) |
| `implement-api-scaffold` | Nest `apps/api` boot + HTTP contract filter/routes | nest-modules-core, api-http-contract ADR |

## Wave B — auth + domain (parallel after Wave A API boots)

| Change name | Focus |
|---|---|
| `implement-auth-better-auth` | Better Auth routes, guards, api-client key header |
| `implement-domain-person` | platform + API CRUD person |
| `implement-domain-channel` | platform + API CRUD channel |
| `implement-domain-greeting` | platform + API CRUD greeting |
| `implement-domain-greeting-reaction` | platform + API CRUD reaction |

## Wave C — async, clients, search (after CRUD exists)

| Change name | Focus |
|---|---|
| `implement-object-storage-adapter` | platform S3 adapter; Coolify test Garage wiring |
| `implement-worker-jobs` | Nest worker + pg-boss |
| `implement-impex` | API runs + worker jobs + one resource E2E |
| `implement-mcp-tools` | MCP tools → platform |
| `implement-web-vite-shell` | Vite React shell + api-client |
| `implement-cli-tui-thin` | Commander/Ink against api-client |
| `implement-search-knowledge-graph` | AGE (or Memgraph) behind platform; API/MCP only |

## Notes

- Prefer small PRs; keep `tasks.md` checkboxes as the agent contract.
- After each Wave, sync/archive OpenSpec changes so main specs stay current.
