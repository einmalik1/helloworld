# Data Model

## Summary

Add durable **`impex_run`** for product-facing import/export status. Platform/ops table (not product CRUD) — same ownership pattern as `job` / `outbox`. Domain `person` (and other catalog tables) unchanged.

## schema.sql changes

- None. Do **not** add `impex_run` to `openspec/data-model/schema.sql` (would create unwanted Nest DTO/API stubs).

## Platform schema (modules)

- Extend `packages/modules/src/database/job-schema.ts` (or sibling `impex-schema.ts` re-exported from `schema-entry.ts`) with `impex_run`:
  - `id` uuid PK
  - `resource` text
  - `direction` text (`import` | `export`)
  - `format` text
  - `status` text (`queued` | `running` | `succeeded` | `failed` | `cancelled`)
  - `object_key` text nullable
  - `error_summary` text nullable
  - `job_id` uuid nullable (references logical `job.id`)
  - `rows_total` int nullable
  - `rows_error` int nullable
  - `created_at` / `updated_at` / `finished_at` timestamptz
- Document in `packages/modules/README.md` and `openspec/data-model/nicht-crud-katalog.md`.
- `pnpm db:generate` → new SQL migration under `packages/modules/drizzle/`.

## Generate

- No `pnpm generate` SQL regen required (no `schema.sql` edits).
- ERD under `openspec/data-model/generated/` stays domain-only.

- [ ] N/A — no `schema.sql` edits; migration from hand-authored Drizzle only

## Notes

No seed data. Person upsert uses existing unique `email`.
