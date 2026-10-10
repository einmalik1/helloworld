# 0008 — Dedicated chat application for LLM

## Status

Accepted

## Context

Product chat needs LLM calls, streaming, and (later) tools. Contested: fold into `apps/api` vs new `apps/chat`; run models in the browser vs server.

## Decision

1. **Add `apps/chat`** as a Nest application (same major Nest line as API).
2. **All LLM provider I/O and secrets live only in chat** (adapter interface). Browsers and other clients MUST NOT hold provider keys.
3. **`apps/web` is a client** of chat’s HTTP/streaming contract; domain CRUD stays on `apps/api`.
4. **Auth** reuses Better Auth sessions and managed API keys (`x-api-key`), not a parallel static key.
5. **Conversations/messages** persist in Postgres via the data-model SoT.

## Consequences

- Coolify: additional Application (+ Dockerfile) when deployed.
- Root `.env` gains chat / LLM adapter keys; no `apps/chat/.env` as primary config.
- Agents must not put OpenAI/Anthropic SDKs in `apps/web`.

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| LLM calls from `apps/web` | Secrets and policy in the browser |
| Chat as routes on `apps/api` only | Couples streaming/provider SDKs to domain CRUD scale and deploy cadence |
| Separate auth stack for chat | Drift vs Better Auth; worse UX |
