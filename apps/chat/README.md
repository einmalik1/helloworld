# chat (`apps/chat`)

Server-side chat component. **LLM provider calls and secrets live only here.**  
`apps/web` is a client of this service — [ADR 0008](../../openspec/decisions/0008-chat-service-app.md).

## Run

```bash
# from repo root
pnpm --filter @helloworld/chat dev
```

Default: `http://localhost:3200` (`CHAT_HOST` / `CHAT_PORT` in root `.env`).

## Auth (v1 stub)

| Mechanism | How |
|---|---|
| API key | Header `x-api-key: $CHAT_DEV_API_KEY` (default `change-me-chat-local`) |
| Session | Cookie `better-auth.session_token=…` (presence check until modules auth is wired) |
| Person | Optional `x-person-id` UUID (defaults to a fixed local UUID) |

`GET /health` is public. Conversation routes require auth.

## HTTP

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | Public |
| POST | `/conversations` | `{ "title"?: string }` |
| GET | `/conversations` | `{ items }` |
| GET | `/conversations/:id/messages` | `{ items }` |
| POST | `/conversations/:id/messages` | `{ "content": string }` → **SSE** (`token`, `assistant_message`, `done`) |

## LLM

`CHAT_LLM_PROVIDER=stub` (default) uses an echo stub. Real providers plug into `src/chat/llm.adapter.ts` without changing the web contract. Env placeholders: `CHAT_LLM_*` in root `.env.example`.

## Persistence

DDL SoT: `conversation` / `message` in [`openspec/data-model/schema.sql`](../../openspec/data-model/schema.sql). Runtime store is in-memory until Drizzle migrate is wired — regenerate types via `pnpm generate:code`.
