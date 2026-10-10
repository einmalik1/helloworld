# 0002 — API HTTP contract

## Status

Accepted (spec-baseline)

## Context

Clients (web, CLI, TUI, tests) need one HTTP shape across all resources. OpenSpec capability: `api-http-contract`.

## Decision

| Area | Choice |
|---|---|
| Error envelope | `{ "error": string }` plus optional `"errors": [...]` for field errors |
| Status mapping | Explicit error-class → HTTP status (NotFound → 404, Validation → **422**, Database → 500, …) |
| Lists | Query `page` / `limit` (max 100); body `{ "items": T[], "total": number }` |
| IDs | UUID |
| Create / delete | `201` / `204` |
| Update | `PATCH` = partial (aligned with generated Update DTOs) |
| Fixed routes | `GET /health` (public), `GET /api/docs`, `GET /openapi.json` |

Service layer returns `neverthrow` results; controllers alone map to `HttpException`.

## Consequences

- Document in `apps/api/README.md`; global exception filter implements the map.
- `tests/api` asserts envelope and list shape.

## Rejected

- Inferring 404 from `message.includes("not found")`.
- Per-route bespoke error JSON.
- Bare array-only list responses as the default (use `{ items, total }`).
