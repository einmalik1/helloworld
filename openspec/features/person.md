# Person

Someone who authors greetings or reacts to them.

**DDL:** `person` in [`../erd/schema.sql`](../erd/schema.sql)  
**OpenSpec:** `domain-person`  
**Glossary:** [`CONTEXT.md`](../../CONTEXT.md)

## Behaviour

- Fields: UUID `id`, `display_name`, unique `email`, `created_at`.
- CRUD via `@helloworld/platform` and `apps/api` under [ADR 0002](../decisions/0002-api-http-contract.md).

## Acceptance

1. Create/list/get/patch/delete person through the API once implemented.
2. Duplicate email is rejected.
