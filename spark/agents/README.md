# Agent kits (roles)

Each directory under `spark/agents/` is an **agent role** with its own rules. Shared rules live only in `common/`.

| Role              | Path                               | Purpose                             |
| ----------------- | ---------------------------------- | ----------------------------------- |
| **common**        | [`common/`](common/)               | Shared rules for all agents         |
| **code-analyzer** | [`code-analyzer/`](code-analyzer/) | Component and architecture analysis |
| **documenter**    | [`documenter/`](documenter/)       | Keep documentation up to date       |
| **log-analyzer**  | [`log-analyzer/`](log-analyzer/)   | Log / ops analysis (Coolify)        |
