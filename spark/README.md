# spark

Delivery home: repo profile, agent roles, process runbooks, and generators.  
**Product SoTs** live under [`openspec/`](../openspec/) — see [`openspec/README.md`](../openspec/README.md).

Coolify deploy targets (**test**, QA, production) live in `repo-profile.yaml`. Worktrees are handled by Orca.

**test** is the shared integration plane for agents/CI (data services + apps behind API/MCP). Do not use host `docker:local:*` from agents on the Coolify server — see `coolify.environments` in `repo-profile.yaml`.

### Reading Coolify test anchors

```bash
# From repo root — profile is the source of truth after provision
grep -A2 'project_uuid\|instance_url\|postgres_uuid\|garage_uuid\|slug: test' spark/repo-profile.yaml
```

Agents/CI: use Coolify **test** Postgres/Garage (and later API/MCP URLs). Never `pnpm run docker:local:up` on the Coolify host.

### Multi-agent work

Wave backlog: [`process/implementation-backlog.md`](process/implementation-backlog.md).  
Agent rules: [`agents/common/multi-agent-delivery.md`](agents/common/multi-agent-delivery.md).  
Active work = `openspec/changes/` (not `plans/`).

| Path | Role |
| --- | --- |
| `repo-profile.yaml` | Packages, Coolify, generators config |
| `process/` | Requirements, CI/CD, operations runbooks + implementation backlog |
| `agents/common/` | Shared rules for all agents |
| `agents/<role>/` | Role kits (code-analyzer, documenter, log-analyzer, …) |
| `plans/` | **Retired** — redirect only |
| `generators/` | Python+Jinja2 codegen (`pnpm generate`) |
| `releases/` | Release manifest and notes (later) |
| `templates/` | Optional templates |

See also root `agents.md`.
