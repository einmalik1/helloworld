# Scaffolder project kit (template)

Per-repo rules for the 🦒 Scaffolder. **Live SoT** is each target's
`spark/agents/scaffolder/` — this hub path is a **copy template**
([`definitions/spark/README.md`](../README.md)).

| Path | Role |
|------|------|
| `rules/project.md` | Project-wide defaults / global exclusions (root tooling + process) |
| `rules/components/<id>.md` | Per-component policy (matches `spark/repo-profile.yaml` → `components:`) |

## Behaviour

- **Always adapt** what fits **existing** `components:` (stack pins, majors, process such as `spark/generators` / `pnpm generate:types` / Orval).
- **update mode → always PR** — never push/merge to default branch; no ask-issues for “large” changes.
- **Reuse** — if an open Scaffolder PR (`chore/scaffolder-stack-sync*` / `[scaffolder]`) still exists, push further syncs onto that branch instead of opening a new PR.
- **Skip** — excluded in rules, or no matching component/surface in this project (do not invent apps).
- Domain DDL content stays local; generator *machinery* may sync.

`components:` in `spark/repo-profile.yaml` is required. Reference = **helloworld**
(company skill `scaffold-golden-path`; `project_type: product-web`).
