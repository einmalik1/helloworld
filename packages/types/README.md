# types

Domain Zod schemas, inferred TypeScript types, and shared error classes.

No NestJS, no DB, no services — schemas/types/errors only.  
Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagestypes).

## Layout

```text
src/
├── schema/        # table Zod schemas from pnpm erd:build (files marked Generated — do not hand-edit)
├── errors.ts      # base + domain error classes (hand-authored when wired)
└── index.ts       # re-exports schema (+ errors later)
```

**Regenerate table schemas:** edit `spec/erd/schema.sql` and/or `spark/repo-profile.yaml` `generators.categories`, then `pnpm erd:build`.

Runtime dependency (intent): `zod` only. Consumed by `packages/modules`, `packages/api-client`, `packages/terminal`, and apps/tools.
