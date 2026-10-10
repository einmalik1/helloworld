# message

| | |
|---|---|
| Label | Message |
| Category | `chat` |
| Spec | openspec/specs/chat-service/spec.md |
| Description | Ordered chat message in a conversation |

## Columns

| Name | SQL type | Logical | Nullable | Default | PK | FK | Comment |
|---|---|---|---|---|---|---|---|
| `id` | `uuid` | UUID | True | gen_random_uuid() | True | — | — |
| `conversation_id` | `uuid` | UUID | False | — | False | `conversation.id` | Parent conversation |
| `role` | `text` | Text | False | — | False | — | user | assistant | system | tool |
| `content` | `text` | Text | False | — | False | — | Message text (tool payloads may be serialized text in v1) |
| `created_at` | `timestamptz` | Timestamp (TZ) | False | now() | False | — | — |

## Constraints

- Primary key: `id`- Check `message_check`: `CHECK (role IN ('user', 'assistant', 'system', 'tool'))`
