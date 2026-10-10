# Data Model

## Summary

No domain entity DDL changes. The generate pipeline gains a **`drizzle`** stage that emits domain Drizzle TypeScript from existing `schema-model.json` (itself from `openspec/data-model/schema.sql`). Better Auth tables are **not** added to `schema.sql`; they live in `packages/modules/src/database/auth-schema.ts`.

## schema.sql changes

- None. Domain tables remain person, channel, greeting, greeting_reaction, conversation, message as already defined.

## Generate

- Existing stages (`core` → `nest_dto`) unchanged in meaning.
- New: `pnpm generate:drizzle` / drizzle included in full `pnpm generate:code`.
- ERD / types / docs under `openspec/data-model/generated/` still come from `pnpm generate` (not hand-edited).
- Initial SQL migrations under `packages/modules/drizzle/` are produced by `pnpm db:generate` from Drizzle schema (domain + auth), not by editing `schema.sql`.

- [x] After wiring: run `pnpm generate:drizzle` (and `pnpm db:generate` once) — no `schema.sql` regen required unless SQL changes later

## Notes

Auth table shapes are owned by Better Auth CLI output path, not the SQL SoT.
