# Channel

Surface where greetings are published (web, cli, …).

**DDL:** `channel` in [`../erd/schema.sql`](../erd/schema.sql)  
**OpenSpec:** `domain-channel`

## Behaviour

- Fields: UUID `id`, unique `slug`, `name`, `created_at`.
- CRUD via platform + API ([ADR 0002](../decisions/0002-api-http-contract.md)).

## Acceptance

1. Create/list/get/patch/delete channel through the API once implemented.
2. Duplicate slug is rejected.
