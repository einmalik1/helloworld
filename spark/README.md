# spark

Repo profile and agent roles. Coolify deploy targets (QA and production) live in `repo-profile.yaml`. Worktrees are handled by Orca.

| Path | Role |
|---|---|
| `repo-profile.yaml` | Packages, Coolify, execution, … |
| `agents/common/` | Shared rules for all agents |
| `agents/<role>/` | Role kits (code-analyzer, documenter, log-analyzer, …) |
| `plans/` | Active / drafts / archive / inbox (process) |
| `scripts/erd/` | ERD pipeline → `spec/erd/generated/` |
| `releases/` | Release manifest and notes (later) |
| `templates/` | Plan templates |

Product specs live under root `spec/` (not here). See also root `agents.md` and `spark/agents/README.md`.
