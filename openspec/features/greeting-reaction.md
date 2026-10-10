# Greeting reaction

Emoji reaction from a person on a greeting.

**DDL:** `greeting_reaction` in [`../erd/schema.sql`](../erd/schema.sql)  
**OpenSpec:** `domain-greeting-reaction`

## Behaviour

- Fields: UUID `id`, `greeting_id`, `person_id`, `emoji`, `created_at`.
- Unique `(greeting_id, person_id, emoji)`.
- Greeting delete cascades reactions.

## Acceptance

1. Duplicate same emoji by same person on same greeting rejected.
2. CRUD via platform + API once implemented.
