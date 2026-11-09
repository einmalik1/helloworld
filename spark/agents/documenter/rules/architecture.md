# Architecture documentation rules

Living docs for **how the system looks now**. Decision history belongs in ADRs (`adr.md`). Do not turn architecture markdown into a changelog of decisions — link to ADRs instead.

## Layers

| Doc | Role |
|-----|------|
| `docs/architecture.md` | **System** view: boundaries, major components, data/control flows, cross-cutting constraints. Single entry point for “current architecture.” |
| `<component-root>/architecture.md` or `docs/architecture/<component-id>.md` | **Component** view: internals that matter only inside that component. Optional. |
| `docs/adr/*` | Why choices were made over time — not a substitute for the views above. |

Use component ids and paths from `spark/repo-profile.yaml` → `components:` when present. Architecture analyzer labels are not components.

## System doc (`docs/architecture.md`)

- Create or update when: Accepted ADRs change the current shape, code/config drift from the doc, or plans introduce a structural change that is already reflected in the tree.
- Prefer updating this file over inventing parallel “overview” docs.
- Follow `../templates/architecture.md`.
- Describe **current** reality. When an ADR is `Superseded` / `Deprecated`, remove or rewrite the obsolete current description here; keep the story in the ADR.
- Link relevant **Accepted** ADRs; do not paste full ADR bodies.
- Keep it short enough to read in one sitting. Deep detail belongs in component docs or code.

## Component docs (optional, challenge required)

Add a component architecture file only when **all** hold:

1. The component has non-trivial **internal** structure (modules, layers, ports) that the system doc cannot cover without becoming unreadable.
2. The content would otherwise be duplicated poorly across READMEs or comments.
3. A path is clear: prefer `<primary component path>/architecture.md` (e.g. `apps/api/architecture.md`) when that tree is the component root; otherwise `docs/architecture/<component-id>.md`.

**Do not** create a component architecture file for every package or every `components:` entry by default. Thin wrappers, pure UI shells, or single-purpose libs usually need none.

Component docs must:

- Link up to `docs/architecture.md` and to relevant ADRs
- Stay inside the component’s boundary (no re-documenting the whole system)
- Follow `../templates/architecture.component.md`

## Sync order in a Documenter pass

1. ADR index + ADR create/status updates (if any) per `adr.md`
2. `docs/architecture.md` from Accepted ADRs + current code
3. Component architecture docs only where they already exist or the challenge above passes
4. Root `README.md` “Further docs” links if architecture entry points are new

## Out of scope here

- Rewriting ADR Decision sections (status/links only on old ADRs)
- ERD generation (see `erd-schema.md` when applicable)
- Inventing target architecture that is not in code or an Accepted/Proposed ADR — escalate instead
