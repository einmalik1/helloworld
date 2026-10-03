# types

Domain Zod schemas, inferred TypeScript types, and shared error classes.

No NestJS, no DB, no services — schemas/types/errors only.  
Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagestypes).

## Layout

```text
src/
├── schema/        # Entity Zod — generated (`pnpm generate:types`)
├── api/           # API Zod (Create/Update/Response) — generated (`pnpm generate:api`)
├── errors.ts      # base + domain error classes (hand-authored when wired)
└── index.ts       # re-exports schema + api
```

| Subpath | Import | Role |
|---|---|---|
| `schema/` | `@helloworld/types/schema` | Persistence / Entity |
| `api/` | `@helloworld/types/api` | HTTP contracts for Nest DTOs + `api-client` |

**Regenerate:** edit `spec/erd/schema.sql` and/or `spark/repo-profile.yaml` `generators:`, then `pnpm generate` (or `pnpm generate:types` / `generate:api`).

**API Create convention:** omit PK-with-default + `generators.api.create_omit_columns` (`created_at`, `updated_at`). Update = Create.partial(). Response = entity schema.

Runtime dependency: `zod`. Nest `createZodDto` wrappers live under `apps/api` (nest_dto stage), not here.
