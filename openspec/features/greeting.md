# Greeting

A hello message posted by a person on a channel.

**DDL:** `greeting` in [`../erd/schema.sql`](../erd/schema.sql)  
**OpenSpec:** `domain-greeting`

## Behaviour

- Fields: UUID `id`, `author_id` → person, `channel_id` → channel, `message`, `created_at`.
- Author delete cascades; channel delete restricted while greetings exist.
- CRUD via platform + API; list filterable by channel.

## Acceptance

1. Create greeting only with existing author and channel.
2. CRUD + channel-filtered list once API is implemented.
