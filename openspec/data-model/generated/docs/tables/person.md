# person

| | |
|---|---|
| Label | Person |
| Category | `core` |
| Spec | openspec/features/README.md |
| Description | Someone who authors greetings or reacts to them |

## Columns

| Name | SQL type | Logical | Nullable | Default | PK | FK | Comment |
|---|---|---|---|---|---|---|---|
| `id` | `uuid` | UUID | True | gen_random_uuid() | True | — | — |
| `display_name` | `text` | Text | False | — | False | — | Public name shown next to greetings |
| `email` | `text` | Text | False | — | False | — | Unique contact address |
| `created_at` | `timestamptz` | Timestamp (TZ) | False | now() | False | — | — |

## Constraints

- Primary key: `id`- Unique `person_unique`: `email`
