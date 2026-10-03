# api

Zod Create / Update / Response schemas → `generators.api.out_dir` (default `packages/types/src/api`).

**Create** omits PK-with-default plus `generators.api.create_omit_columns` (default `created_at`, `updated_at`).  
**Update** = Create.partial(). **Response** = entity schema.
