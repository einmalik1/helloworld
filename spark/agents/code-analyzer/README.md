# Code-analyzer — Hello World

Agent role for component and architecture analysis. The orchestrator spawns one worker per entry in `components.yaml`, plus architecture when enabled.

Shared rules: [`../common/`](../common/). Role rules only under `rules/` here.

| Path                    | Role                               |
| ----------------------- | ---------------------------------- |
| `components.yaml`       | Component spawn list               |
| `rules/project.md`      | Ticket policy for analyzer workers |
| `rules/architecture.md` | Cross-app boundaries               |
| `rules/components/*.md` | Component lenses                   |
