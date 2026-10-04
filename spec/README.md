# Spec

Product specification — source of truth for features, domain decisions, architecture, tech stack, and the data model.

`apps/docs` publishes this tree; do not author durable specs inside the docs app.

| Path | Role |
|---|---|
| `features/` | Feature specs (behaviour, acceptance) |
| `decisions/` | Architecture decision records (ADRs) |
| `architecture.md` | System picture and boundaries (tech-agnostic) |
| `tech-stack.md` | Technology stack inventory |
| `tech-stack-todo.md` | Spec backlog vs template gaps (decide / write / impl later) |
| `erd/schema.sql` | Data model (hand-edit only) |
| `erd/generated/` | Output from `pnpm generate` (JSON, ERD, docs/, types/) — do not edit |

Related: root `CONTEXT.md` (ubiquitous language). Plans live under `spark/plans/` (process), not here.
