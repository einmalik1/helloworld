# Nicht-CRUD Katalog

Platform / ops tables that are **not** product REST CRUD resources (no Nest DTO / Orval stubs from `schema.sql`).

| Table | Owner | Notes |
|---|---|---|
| Better Auth (`user`, `session`, `account`, `verification`, `apikey`, …) | Better Auth CLI → `packages/modules/src/database/auth-schema.ts` | Not in `schema.sql` |
| `job` | Worker / ADR 0007 → `packages/modules/src/database/job-schema.ts` | Operator list/status/retry on `apps/worker` |
| `outbox` | Worker projection sync → `job-schema.ts` | Drained by `@nestjs/schedule`; AGE/Typesense handlers land with search/impex |

Domain CRUD SoT remains [`schema.sql`](schema.sql).
