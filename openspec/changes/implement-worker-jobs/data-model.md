# Data Model

## Summary

Add durable **job** and **outbox** tables for worker schedule + operator HTTP. These are **platform/ops** tables (not product CRUD). Keep them out of `schema.sql` / Nest DTO generators (same pattern as Better Auth schema ownership). Impex-specific `impex_run` stays for `#48`.

## schema.sql changes

- None. Do **not** add `job` / `outbox` to `openspec/data-model/schema.sql` (would create unwanted types/api/nest_dto stubs).

## Platform schema (modules)

- Hand-author `packages/modules/src/database/job-schema.ts` (Drizzle): `job` + `outbox` tables.
- Re-export from `schema-entry.ts` so drizzle-kit + `DatabaseService` see them.
- Document briefly in `packages/modules/README.md` and `nicht-crud-katalog.md`.
- `pnpm db:generate` → new SQL migration under `packages/modules/drizzle/`.

## Generate

- No `pnpm generate` SQL regen required for this change.
- ERD under `openspec/data-model/generated/` stays domain-only; note job/outbox in nicht-crud katalog.

- [x] N/A — no `schema.sql` edits; migration from hand-authored Drizzle only

## Notes

No seed data. Auth tables remain Better Auth owned.
