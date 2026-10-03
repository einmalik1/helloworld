# channel

| | |
|---|---|
| Label | Channel |
| Category | `core` |
| Spec | spec/features/README.md |
| Description | Surface where greetings are published (web, cli, …) |

## Columns

| Name | SQL type | Logical | Nullable | Default | PK | FK | Comment |
|---|---|---|---|---|---|---|---|
| `id` | `uuid` | UUID | True | gen_random_uuid() | True | — | — |
| `slug` | `text` | Text | False | — | False | — | Stable machine key for the channel |
| `name` | `text` | Text | False | — | False | — | Human-readable channel title |
| `created_at` | `timestamptz` | Timestamp (TZ) | False | now() | False | — | — |

## Constraints

- Primary key: `id`- Unique `channel_unique`: `slug`
