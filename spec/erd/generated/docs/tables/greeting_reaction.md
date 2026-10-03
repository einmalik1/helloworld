# greeting_reaction

| | |
|---|---|
| Label | Greeting reaction |
| Category | `social` |
| Spec | spec/features/README.md |
| Description | Emoji reaction from a person on a greeting |

## Columns

| Name | SQL type | Logical | Nullable | Default | PK | FK | Comment |
|---|---|---|---|---|---|---|---|
| `id` | `uuid` | UUID | True | gen_random_uuid() | True | — | — |
| `greeting_id` | `uuid` | UUID | False | — | False | `greeting.id` | Greeting being reacted to |
| `person_id` | `uuid` | UUID | False | — | False | `person.id` | Person who reacted |
| `emoji` | `text` | Text | False | — | False | — | Reaction emoji (e.g. thumbs-up) |
| `created_at` | `timestamptz` | Timestamp (TZ) | False | now() | False | — | — |

## Constraints

- Primary key: `id`- Unique `greeting_reaction_unique`: `greeting_id`, `person_id`, `emoji`
