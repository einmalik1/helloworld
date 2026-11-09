# ADR rules

Architecture Decision Records capture **why** a choice was made — not a living description of the system. Current shape lives in `docs/architecture.md` (see `architecture.md` in this folder).

## Locations

| Path | Role |
|------|------|
| `docs/adr/README.md` | Index of all ADRs (required whenever any ADR exists) |
| `docs/adr/NNNN-slug.md` | One decision per file (`0001-use-postgres.md`) |
| `../templates/adr.md` | Shape for new ADRs |

Create `docs/adr/` on the first accepted ADR in the repo. Keep numbering zero-padded and monotonic; never reuse a number.

## When to create an ADR (must pass the challenge)

Create or propose an ADR only when **all** of the following hold:

1. There is a real **decision** with at least one credible alternative that was rejected (or would reasonably be considered).
2. The choice has lasting **consequences** for structure, boundaries, data, security, ops, or cross-cutting conventions.
3. Someone later would otherwise re-litigate the same trade-off without this record.

**Do not** create an ADR for:

- Routine implementation details, refactors, or renames with no architectural trade-off
- Library/version bumps unless they change a platform constraint
- Feature behavior that belongs in specs/plans, not architecture
- Restating what `docs/architecture.md` or code already make obvious
- Every plan merge or every PR — only when a durable decision changed

**Hard challenge (required before writing):** Ask: “Would a new engineer need this to avoid reversing a costly choice?” If no → update architecture docs or escalate; do **not** add an ADR. Prefer fewer, sharper ADRs. Cap: at most a small handful of new ADRs per Documenter run; if more candidates exist, pick the highest-impact ones and list the rest in the completion notes.

## Status lifecycle

| Status | Meaning |
|--------|---------|
| `Proposed` | Candidate; not yet binding. Prefer this when intent is inferred from code/plans without clear human/plan confirmation. |
| `Accepted` | Binding decision. |
| `Deprecated` | No longer recommended; not replaced by a specific ADR (or replacement is broader docs only). |
| `Superseded` | Replaced by a newer ADR — set `Superseded by: ADR-NNNN` and link both ways. |
| `Rejected` | Considered and explicitly not taken — keep for history. |

**Never delete** an ADR that was committed as `Accepted`, `Deprecated`, `Superseded`, or `Rejected`. Only unmerged local drafts may be discarded. Revising a decision = new ADR + mark the old one `Superseded` (do not rewrite the old Decision section except for typos or status/link metadata).

## How to write

1. Load the index (`docs/adr/README.md`) and existing ADRs before adding anything.
2. Sources (in order): existing ADRs → `docs/architecture.md` / component architecture docs → code & config → plans/specs under `spark/plans/` (and related product docs). Plans inform intent; do not invent decisions the plan does not support.
3. Use `../templates/adr.md`. One decision per file. Title is the decision, not the feature name.
4. Update the index on every create/status change (number, title, status, date, supersedes / superseded by).
5. After ADR changes that affect the current system shape, update `docs/architecture.md` (and component architecture docs if needed) per `architecture.md` — ADRs are history; architecture docs are the current view.
6. If code and plans disagree, or acceptance is unclear → escalate with a `docs` ticket; leave candidates as `Proposed` or make no ADR.

## Index format

Table columns at minimum: **ADR** | **Title** | **Status** | **Date** | **Notes** (supersedes / superseded by). Optionally filter or section **Accepted** above a full archive list so the active set stays scannable.
