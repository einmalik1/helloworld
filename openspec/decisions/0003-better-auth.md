# 0003 — Better Auth vs static API_KEY

## Status

Accepted

## Context

Hello World needs authentication for the web app (sessions) and for CLI/TUI/automation (machine credentials). A prior Nest template used a static env `API_KEY` plus a global `ApiKeyModule` / header check with `@Public()` opt-out. That pattern does not cover web sessions, key lifecycle (issue/revoke), or per-operator credentials.

Contested choices: Better Auth (sessions + `@better-auth/api-key`) vs static env key; hand-written Nest wiring vs a community Nest Better Auth module; where long-term CLI keys live.

Issue: [#7](https://github.com/einmalik1/helloworld/issues/7) (tech-stack topic **#5**). Inventory: [`tech-stack.md` § Auth](../tech-stack.md#auth-better-auth).

## Decision

1. **Use Better Auth** (`better-auth` **1.7.7** + `@better-auth/api-key` **1.7.7**) for web **cookie sessions** and **managed API keys** in parallel.
2. **Hand-write** the Better Auth instance in `packages/modules` Auth module and register a Nest **global** guard (session cookie and/or `verifyApiKey`). Do **not** adopt a community Nest Better Auth wrapper for v1.
3. **Freeze API key header `x-api-key`** for Nest verification and the `packages/api-client` ky mutator.
4. **Drive CORS / `trustedOrigins` from `WEB_ORIGIN`.** Mark `GET /health`, Better Auth HTTP routes, and OpenAPI (`/api/docs`, `/openapi.json`) with **`@Public()`**.
5. **Issue/revoke keys** via web settings (or an authenticated CLI subcommand). Store operator keys **per environment** in `@helloworld/terminal/config` — **never** root `.env` as the long-term key store.
6. Auth Drizzle schema remains Better Auth CLI-owned (see [`0001-schema-migrations`](0001-schema-migrations.md)) — not merged into `openspec/data-model/schema.sql`.

## Consequences

- Nest `envSchema` requires `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and `WEB_ORIGIN` — not a product-level static `API_KEY`.
- Implementers wire Auth module + global guard + Better Auth routes before protecting feature controllers.
- CLI/TUI resolve `apiKey` from terminal config into `configureClient`; OpenAPI documents `x-api-key`.
- Ops topic **#10** may still refine CORS multi-origin / rate limits; this ADR freezes the auth *model*.

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Static env `API_KEY` + `ApiKeyModule` / `ApiKeyGuard` | No web sessions, no key lifecycle, one shared secret for all operators; unfit as the product auth model |
| Community Nest Better Auth module as primary integration | Extra, less-proven dependency; hand-written instance keeps Better Auth as SoT for auth HTTP routes with fewer moving parts |
| Long-term CLI keys in root `.env` | Conflicts with single-root-env-for-processes rule; not per-operator / per-env; easy to commit secrets |
| Different API-key header than `x-api-key` | Breaks the existing api-client sketch and prior mental model without benefit |
