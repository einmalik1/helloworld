# ERD / schema.sql sync (template)

Use this rule **only when** the repo documents its data model via a hand-edited SQL schema and a regenerate command (typically `docs/erd/schema.sql` + a package script such as `erd:build`).

If those paths/scripts are missing, skip this rule entirely.

## Purpose

Keep the documented ERD aligned with the **runtime** schema in code when entities or attributes change.

## Drift signals (any of these)

Compare recent code changes (and current tree) against `docs/erd/schema.sql`:

- New entity / table in Drizzle (or equivalent) but missing in `schema.sql`
- Entity / table renamed or removed in code but not in `schema.sql`
- Column / attribute added, renamed, typed differently, nullability/default/FK/index/check changed, or removed
- Enum / status value sets changed in code but COMMENT/CHECK text in `schema.sql` still old

## Required actions when drift exists

1. **Update** `docs/erd/schema.sql` by hand (this file is the diagram source of truth — do **not** invent a second schema elsewhere).
   - Follow existing header conventions (`COMMENT ON TABLE` metadata, `@category` lines, one element per line).
   - Mirror the runtime schema’s tables/columns/FKs/checks; keep domain wording in COMMENT/`desc` unless the product docs say otherwise.
2. **Regenerate** diagrams with the project’s package script (see project override; default pattern `bun run erd:build` or `npm run erd:build`).
3. **Commit** `schema.sql` **and** the regenerated tree under `docs/erd/generated/` together (never edit `generated/` by hand).

## Do not

- Hand-edit files under `docs/erd/generated/`
- Change migrations or production DB as part of Documenter (migrations stay with developer/shipper)
- Invent tables that are not in the runtime schema “for documentation only”
- Skip regenerate after editing `schema.sql`

## When blocked

If code and product docs disagree on the model and you cannot decide which is correct, escalate with a `docs` ticket (board → `review`) instead of guessing.
