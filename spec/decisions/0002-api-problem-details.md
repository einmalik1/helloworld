# 0002 — API error envelope and validation status

## Status

Accepted

## Context

Hello World needs a single HTTP error contract before the Nest exception filter (#7) and Orval client mutator are sketched. Contested choices: legacy `{ error }` / `{ error, errors[] }` vs [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html); **400** vs **422** for Zod validation failures.

Issue: [#5](https://github.com/einmalik1/helloworld/issues/5). Spec: [`apps/api/README.md` § HTTP contract](../../apps/api/README.md#http-contract).

## Decision

1. **Error bodies follow RFC 9457 Problem Details** (`application/problem+json`): `type`, `title`, `status`, `detail`, plus optional extension `errors` for field-level Zod issues. One global filter; no per-route shapes.
2. **Validation failures use HTTP 400** (Nest / nestjs-zod idiomatic; Zalando-style guidance). Do **not** use 422 for Zod / ValidationPipe failures in this stack.
3. **Status codes come only from typed error classes** in `@helloworld/types` (plus Nest validation) — never `message.includes(...)` or other string sniffing.
4. **NotFound → 404**; **DatabaseError / unknown → 500** (no internals/secrets in the body).

## Consequences

- Exception filter (#7) and OpenAPI error examples must emit Problem Details, not `{ error }`.
- Orval / ky mutator should treat `application/problem+json` and branch on `type` (and HTTP status), not free-text `detail`.
- Clients must not assume 422 for validation; tests and docs use 400.
- Problem `type` URIs need a small documented catalog when the filter is implemented (stable strings or URLs).

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Legacy `{ error }` / `{ error, errors[] }` envelope | Weaker interoperability; RFC 9457 is the industry default (Zalando, OpenAPI guidance) |
| Per-route error shapes | Breaks one global filter + Orval mutator; drifts across resources |
| HTTP **422** for Zod validation | Allowed by RFC 9110/9457 for “syntax ok, semantic fail”, but Nest ValidationPipe / nestjs-zod examples and Zalando tend to **400** — freeze 400 so #7 does not re-litigate |
| Status via `message.includes("not found")` | Fragile; bypasses typed errors in `@helloworld/types` |
