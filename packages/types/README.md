# types

Domain Zod schemas, inferred TypeScript types, and shared error classes.

No NestJS, no DB, no services — schemas/types/errors only.  
Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagestypes).

## Layout

```text
src/
├── errors.ts      # base + domain error classes (when wired)
├── *.types.ts     # domain Zod schemas
└── index.ts
```

Runtime dependency (intent): `zod` only. Consumed by `packages/modules`, `packages/api-client`, `packages/terminal`, and apps/tools.
