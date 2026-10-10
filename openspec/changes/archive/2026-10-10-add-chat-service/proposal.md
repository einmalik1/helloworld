# Proposal

## Why

Hello World needs an in-product chat experience backed by LLMs. Putting model keys, tool loops, and streaming in `apps/web` would leak secrets and couple UI to providers. A dedicated **server-side chat component** owns LLM integration; the web app is only a client.

## What Changes

- Add a new long-running app **`apps/chat`** (Nest, same major line as API): HTTP (and streaming) surface for conversations/messages; **LLM providers and tools run only here**.
- **`apps/web`** talks to `apps/chat` (not directly to OpenAI/Anthropic/etc.); auth via Better Auth session or API key consistent with the platform.
- Persist conversation/message metadata in the data model (`schema.sql` + generate) so history is rebuildable and permissioned.
- Document the boundary in architecture/tech-stack and an ADR (why not fold chat into `apps/api`).
- Light design-system notes for the chat panel (composition only — not a full design language rewrite).

**Out of scope for this change’s apply spike (unless tasks say otherwise):** picking a final paid LLM vendor contract, RAG over AGE/Typesense, MCP tools calling chat, mobile clients. Provider MUST be behind an adapter interface so the vendor can be swapped.

## Capabilities

### New Capabilities

- `chat-service`: Server-side chat application behaviour — conversations, messages, streaming responses, LLM adapter boundary, auth, and the rule that browsers never hold provider credentials.

### Modified Capabilities

- `local-dev-runtime`: Root `.env` / Compose docs MUST cover chat service config (`CHAT_*` or documented section) alongside existing data plane.
- `auth-better-auth`: Chat routes MUST participate in the same session / `x-api-key` story (public only where explicitly marked).

## Impact

- **New app:** `apps/chat` (+ Dockerfile / Coolify Application later).
- **Data model:** conversation + message tables (and FKs to `person` where authorship applies).
- **Web:** chat UI client against chat HTTP/SSE (or WS if design chooses — default SSE/HTTP stream).
- **Does not replace:** `apps/mcp` (agents) or `apps/api` domain CRUD; chat MAY call platform/API for tool use later, not in the minimal spike.
