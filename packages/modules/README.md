# modules

Reusable NestJS infrastructure for `apps/api` (and other Nest apps).

Stack: [`spec/tech-stack.md`](../../spec/tech-stack.md#packagesmodules).  
Depends on `@helloworld/types` when wired.

## Layout

```text
src/
├── config/      # createAppConfigModule — Zod env at boot
├── database/    # DatabaseModule + DatabaseService (Drizzle + PostgreSQL)
├── health/      # HealthModule (e.g. @nestjs/terminus)
├── auth/        # Better Auth wiring for Nest
├── openapi/     # setupOpenApi — Swagger UI + JSON
└── index.ts
```

Subpath exports per module when implemented. Not for CLI/TUI — those use `@helloworld/api-client`.
