# ADR Review Manifest

## ADR Review Completed

- Date: 2026-10-10
- Reviewer: agent (propose)
- Change: add-chat-service

## In-Force ADR Context Reviewed

- openspec/decisions/0002-api-http-contract.md — Problem Details / HTTP habits for chat errors
- openspec/decisions/0003-better-auth.md — sessions + API keys
- openspec/decisions/0004-platform-facade-mcp.md — domain stays on platform/api; chat is separate product surface
- openspec/decisions/0007-worker-schedule-not-pg-boss.md — chat not required to use worker for v1 streaming

## Repository-Level ADRs Created

- openspec/decisions/0008-chat-service-app.md — dedicated `apps/chat` owns LLM; web is client

## Notes

No supersession of prior ADRs. Provider vendor choice left to tech-stack inventory at apply time behind the adapter.
