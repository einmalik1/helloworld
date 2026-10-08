# Code-analyzer — Hello World

Agent role for component and architecture analysis. Components live in
`spark/repo-profile.yaml` (`components:`). Architecture is enabled via
`code_analyzer.architecture` (analyzer loop only, not a product component).

Shared rules: [`../common/`](../common/). Role rules only under `rules/` here.

| Path | Role |
|---|---|
| `../../repo-profile.yaml` | `components:` + `code_analyzer.architecture` |
| `rules/project.md` | Ticket policy for analyzer workers |
| `rules/architecture.md` | Cross-app boundaries |
| `rules/components/*.md` | Component lenses |
