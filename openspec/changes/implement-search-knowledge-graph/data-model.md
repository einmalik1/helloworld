# Data Model

## Summary

Add transactional outbox table for async AGE + Typesense projection. No changes to person/channel/greeting/greeting_reaction/conversation/message entity shapes.

## Entities / tables

| Table                | Change                                          |
| -------------------- | ----------------------------------------------- |
| `search_sync_outbox` | **New** — durable work rows for projection sync |

## schema.sql changes

Append:

```sql
CREATE TABLE search_sync_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  op text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  CHECK (aggregate_type IN ('person', 'channel', 'greeting', 'reaction')),
  CHECK (op IN ('upsert', 'delete'))
);

CREATE INDEX search_sync_outbox_pending_idx
  ON search_sync_outbox (created_at)
  WHERE processed_at IS NULL;

COMMENT ON TABLE search_sync_outbox IS 'category: infra | label: Search sync outbox | spec: openspec/specs/search-knowledge-graph/spec.md | desc: Async AGE/Typesense projection work drained by apps/worker';
```

AGE graph catalog objects are **not** modeled in `schema.sql` (extension-managed); worker creates graph `helloworld` at rebuild.

## Generate

- ERD/types under `openspec/data-model/generated/` come from `pnpm generate` (not hand-edited).
- After SQL edit: `pnpm generate:code` (or at least core + drizzle) then `pnpm db:generate` / `pnpm db:migrate`.

## Tasks

- Tasks section “Schema / outbox” applies SQL + regenerate Drizzle + migration.
