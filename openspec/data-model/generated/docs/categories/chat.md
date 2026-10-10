# Category: Chat

Key: `chat` · Color: `#d97706`

## Tables

- [`conversation`](../tables/conversation.md)
- [`message`](../tables/message.md)

## Edges involving this category

| From | Column | To | Kind |
|---|---|---|---|
| conversation | owner_person_id | person.id | fk |
| message | conversation_id | conversation.id | fk |
