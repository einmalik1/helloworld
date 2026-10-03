# Category: Core

Key: `core` · Color: `#2563eb`

## Tables

- [`person`](../tables/person.md)
- [`channel`](../tables/channel.md)
- [`greeting`](../tables/greeting.md)

## Edges involving this category

| From | Column | To | Kind |
|---|---|---|---|
| greeting | author_id | person.id | fk |
| greeting | channel_id | channel.id | fk |
| greeting_reaction | greeting_id | greeting.id | fk |
| greeting_reaction | person_id | person.id | fk |
