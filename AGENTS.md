# Agents — working agreements

Short pointer for agents and conventions in this monorepo.

- **Repo profile:** [`spark/repo-profile.yaml`](spark/repo-profile.yaml)
- **Agent roles:** [`spark/agents/`](spark/agents/) — shared rules under [`common/`](spark/agents/common/)
- **Git / process conventions** (branches, Conventional Commits, smoke pre-merge gate): [`spark/agents/common/conventions.md`](spark/agents/common/conventions.md#git-conventions)
- **New resource workflow** (SQL → generate → migrate → Nest → client): [`spark/agents/common/conventions.md`](spark/agents/common/conventions.md#new-resource-workflow)
- **Product specs:** [`spec/`](spec/) — features, decisions, architecture, tech-stack, ERD (`schema.sql` + `spark/repo-profile.yaml` generators + `pnpm generate`)
- **Domain glossary:** [`CONTEXT.md`](CONTEXT.md)

Structure and components: see root [`README.md`](README.md). Development and worktrees run via Orca.
