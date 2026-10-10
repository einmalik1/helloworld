# api (tests)

Interface tests against the running REST `api` (and Postgres; S3 when file routes are under test).

| Layer      | Tool                                               | Role                                                                                  |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Suite here | Vitest + **supertest** (or equivalent HTTP client) | Black-box against `API` base URL from **root** `.env`                                 |
| In-app     | Vitest + `@nestjs/testing` + supertest             | Lives under `apps/api` — see [`apps/api/README.md`](../../apps/api/README.md#testing) |

**Env:** reuse root `.env` / `.env.example` (`API_PORT`, `DATABASE_URL`, …) — no `tests/api/.env`.

**Prerequisites:** root [Local development](../../README.md#local-development); `api` + Postgres up.
