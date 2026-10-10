# 0003 — Better Auth

## Status

Accepted (spec-baseline)

## Context

Web needs sessions; CLI/TUI/machines need non-interactive credentials. OpenSpec: `auth-better-auth`.

## Decision

- Use **Better Auth** (+ `@better-auth/api-key`) as the only product auth system.
- **Sessions** (cookies) for `apps/web`.
- **Managed API keys** for CLI/TUI/MCP/machines; header candidate **`x-api-key`** (document in api-client).
- Global Nest guard with **`@Public()`** for anonymous routes (at least `/health`).
- Auth tables via migrations (see ADR 0001).

## Consequences

- Env keys already sketched in `.env.example` (`BETTER_AUTH_*`, `WEB_ORIGIN`).
- No parallel custom JWT stack in the template.

## Rejected

- Static shared `API_KEY` env module as the sole gate.
