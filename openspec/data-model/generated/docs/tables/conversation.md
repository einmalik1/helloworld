# conversation

| | |
|---|---|
| Label | Conversation |
| Category | `chat` |
| Spec | openspec/specs/chat-service/spec.md |
| Description | Chat thread owned by a person; LLM traffic via apps/chat only |

## Columns

| Name | SQL type | Logical | Nullable | Default | PK | FK | Comment |
|---|---|---|---|---|---|---|---|
| `id` | `uuid` | UUID | True | gen_random_uuid() | True | — | — |
| `owner_person_id` | `uuid` | UUID | False | — | False | `person.id` | Person who owns the conversation |
| `title` | `text` | Text | True | — | False | — | Optional display title |
| `created_at` | `timestamptz` | Timestamp (TZ) | False | now() | False | — | — |
| `updated_at` | `timestamptz` | Timestamp (TZ) | False | now() | False | — | — |

## Constraints

- Primary key: `id`