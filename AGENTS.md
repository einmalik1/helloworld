# Agents — working agreements

Short pointer for agents and conventions in this monorepo.

- **Repo map (product vs delivery):** [`openspec/README.md`](openspec/README.md)
- **Product SoTs:** [`openspec/`](openspec/) — specs, data-model, decisions, design-system, architecture/tech-stack
- **Delivery / process:** [`spark/`](spark/) — [`process/`](spark/process/), agents, Coolify profile, generators
- **Repo profile:** [`spark/repo-profile.yaml`](spark/repo-profile.yaml)
- **Agent roles:** [`spark/agents/`](spark/agents/) — multi-agent rules [`common/multi-agent-delivery.md`](spark/agents/common/multi-agent-delivery.md)
- **Implementation waves:** [`spark/process/implementation-backlog.md`](spark/process/implementation-backlog.md)
- **Git / process conventions** (branches, Conventional Commits, smoke pre-merge gate): [`spark/agents/common/conventions.md`](spark/agents/common/conventions.md#git-conventions)
- **New resource workflow** (SQL → generate → migrate → Nest → client): [`spark/agents/common/conventions.md`](spark/agents/common/conventions.md#new-resource-workflow)
- **Domain glossary:** [`CONTEXT.md`](CONTEXT.md)

Structure and components: see root [`README.md`](README.md). Development and worktrees run via Orca.
