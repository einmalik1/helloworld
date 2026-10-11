# search_sync_outbox

|             |                                                            |
| ----------- | ---------------------------------------------------------- |
| Label       | Search sync outbox                                         |
| Category    | `infra`                                                    |
| Spec        | openspec/specs/search-knowledge-graph/spec.md              |
| Description | Async AGE/Typesense projection work drained by apps/worker |

## Columns

| Name             | SQL type      | Logical        | Nullable | Default           | PK    | FK  | Comment                                   |
| ---------------- | ------------- | -------------- | -------- | ----------------- | ----- | --- | ----------------------------------------- |
| `id`             | `uuid`        | UUID           | True     | gen_random_uuid() | True  | —   | —                                         |
| `aggregate_type` | `text`        | Text           | False    | —                 | False | —   | person                                    | channel | greeting | reaction |
| `aggregate_id`   | `uuid`        | UUID           | False    | —                 | False | —   | Domain entity UUID being projected        |
| `op`             | `text`        | Text           | False    | —                 | False | —   | upsert                                    | delete  |
| `payload`        | `jsonb`       | JSON           | True     | —                 | False | —   | Optional snapshot for upsert projection   |
| `created_at`     | `timestamptz` | Timestamp (TZ) | False    | now()             | False | —   | —                                         |
| `processed_at`   | `timestamptz` | Timestamp (TZ) | True     | —                 | False | —   | Set when worker finishes applying the row |

## Constraints

- Primary key: `id`- Check `search_sync_outbox_check`: `CHECK (aggregate_type IN ('person', 'channel', 'greeting', 'reaction'))`
- Check `search_sync_outbox_check`: `CHECK (op IN ('upsert', 'delete'))`
