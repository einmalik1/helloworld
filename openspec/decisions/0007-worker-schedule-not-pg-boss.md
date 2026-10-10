# 0007 — Worker jobs with Nest schedule (not pg-boss in v1)

## Status

Accepted, supersedes ADR-0005

## Supersedes

0005-worker-pg-boss.md

## Context

ADR 0005 chose pg-boss on PostgreSQL for durable jobs. Merged product inventory (`tech-stack.md`) and search/impex sync design freeze Nest **`@nestjs/schedule`** with Postgres-backed work/outbox state for template v1 — no separate queue broker. Keeping both stories active confuses agents.

OpenSpec: `worker-jobs`, `impex`, `search-knowledge-graph`.

## Decision

1. **v1 job triggers:** Nest `@nestjs/schedule` (cron/interval) in `apps/worker`.
2. **Work state:** Persist job/run/outbox state in **PostgreSQL** (same SoT DB); Redis MUST NOT be required.
3. **API contract unchanged:** enqueue/start returns quickly (`202` intent); worker executes heavy work (impex, AGE/Typesense projection).
4. **Operator HTTP** on worker (`GET /health`, list/status/retry) remains required.
5. **pg-boss** (or another broker) MAY return in a later ADR if schedule+outbox proves insufficient — not the v1 default.

## Consequences

- Update capability `worker-jobs` and impex prose to stop mandating pg-boss.
- Worker depends on `DATABASE_URL` (+ S3/Typesense as jobs need).
- ADR 0005 remains historical; do not edit its file.

## Rejected alternatives

| Alternative | Why rejected for v1 |
|---|---|
| Keep pg-boss as mandatory default | Conflicts with frozen tech-stack; extra operational surface |
| Redis-backed queue | Rejected since ADR 0005; still rejected |
| Sync-only heavy impex on API thread | Still rejected |
