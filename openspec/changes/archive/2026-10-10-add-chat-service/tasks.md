# Tasks

## 1. Spec homes and ADR index

- [x] 1.1 Ensure ADR `0008-chat-service-app.md` is indexed in `openspec/decisions/README.md` and verify the link opens
- [x] 1.2 Add `apps/chat` row to `openspec/architecture.md` + inventory note in `openspec/tech-stack.md`; verify both mention chat owns LLM

## 2. Data model

- [x] 2.1 Add `conversation` and `message` tables to `openspec/data-model/schema.sql` with FKs/comments; verify SQL parses
- [x] 2.2 Run `pnpm generate:code` and verify generated types/ERD include the new tables

## 3. Chat app scaffold

- [x] 3.1 Scaffold `apps/chat` Nest app (package, tsconfig, health) and verify `GET /health` is public
- [x] 3.2 Wire Better Auth session and/or `x-api-key` guard consistent with API; verify anonymous conversation create fails
- [x] 3.3 Implement conversation + message HTTP + streaming assistant path behind an LLM adapter (stub provider acceptable); verify one streamed reply in a local/manual check
- [x] 3.4 Add root `.env.example` chat/LLM section and `apps/chat` README; verify documented keys exist

## 4. Web client

- [x] 4.1 Add a minimal chat UI in `apps/web` that calls the chat service (env base URL); verify browser traffic does not target the LLM vendor
- [x] 4.2 Note chat UI baseline in `openspec/design-system/README.md`; verify section exists

## 5. Validation

- [x] 5.1 Run `openspec validate add-chat-service` and verify it passes

## Workflow follow-up

- Prefer applying `align-main-merge-gaps` before or carefully alongside this change if both touch `local-dev-runtime`.
- Archive after review; Coolify Application for chat can follow in a deploy change.
