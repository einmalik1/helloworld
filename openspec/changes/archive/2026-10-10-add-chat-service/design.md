# Design

## Context

See proposal.md — Why. Today: `apps/web`, `apps/api`, `apps/mcp`, `apps/worker`. No chat app; LLM must not land in the browser.

## Goals / Non-Goals

**Goals:** Separate `apps/chat` Nest service; web client; persisted conversations; adapter-shaped LLM; shared Better Auth story.  
**Non-Goals:** Final vendor lock-in, RAG over AGE/Typesense in v1 spike, MCP-as-chat-client, full design-system rewrite.

## Decisions

1. **New app `apps/chat`**, not a Nest module inside `apps/api` — isolates streaming, provider SDKs, and scale profile from domain CRUD.
2. **Transport:** HTTP + **SSE** (or chunked response) for assistant tokens in v1; WebSockets deferred unless SSE proves insufficient.
3. **Persistence:** Tables `conversation` + `message` in `openspec/data-model/schema.sql` (FK to `person` for owner/author where applicable); generate types/DTOs.
4. **Auth:** Same Better Auth session cookie + `x-api-key` as API; CORS/`trustedOrigins` from `WEB_ORIGIN`.
5. **Web:** Chat panel/route in `apps/web` calls chat base URL from root env (`VITE_CHAT_URL` or documented equivalent) — never provider URL.
6. **LLM adapter:** Interface in chat (or small package only chat depends on); one stub/dev provider + one real provider config via env.

## Risks / Trade-offs

- [Two backends for web] → Document when to call api vs chat; shared auth cookies across origins need careful cookie domain / proxy — prefer same-site reverse proxy path in Coolify later (`/chat` → chat) if cookie sharing is painful.
- [History growth] → Keep messages append-only; pagination on list later.

## Migration Plan

1. ADR + data-model DDL + generate.
2. Scaffold `apps/chat` + env + health.
3. Minimal conversation/message API + SSE + stub LLM.
4. Thin web client.
5. Archive specs.

## Open Questions

- Cookie strategy across api/chat ports in local dev (proxy vs dual Set-Cookie) — resolve at apply with the simplest local approach; document in apps/chat README.
