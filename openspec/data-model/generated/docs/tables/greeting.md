# greeting

| | |
|---|---|
| Label | Greeting |
| Category | `core` |
| Spec | openspec/features/README.md |
| Description | A hello message posted by a person on a channel |

## Columns

| Name | SQL type | Logical | Nullable | Default | PK | FK | Comment |
|---|---|---|---|---|---|---|---|
| `id` | `uuid` | UUID | True | gen_random_uuid() | True | — | — |
| `author_id` | `uuid` | UUID | False | — | False | `person.id` | Person who wrote the greeting |
| `channel_id` | `uuid` | UUID | False | — | False | `channel.id` | Channel where the greeting appears |
| `message` | `text` | Text | False | — | False | — | Display text of the greeting |
| `created_at` | `timestamptz` | Timestamp (TZ) | False | now() | False | — | — |

## Constraints

- Primary key: `id`