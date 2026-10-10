# Decisions (ADRs)

Architecture Decision Records for this monorepo. Process home for when/how we write ADRs. Product inventory: [`tech-stack.md`](../tech-stack.md); system shape: [`architecture.md`](../architecture.md).

## When an ADR is required

Write an ADR when the choice is a **contested product decision** with lasting consequences and rejected alternatives.

Do **not** write an ADR for every inventory row or routine version bump. Factual “what/version” belongs in `tech-stack.md`; “why / consequences / rejected” belongs here.

## Naming

Files: `NNNN-short-title.md` (four-digit zero-padded sequence, kebab-case title).

Next number = highest existing `NNNN` + 1.

## Placement

- **Product ADRs** live only under `openspec/decisions/`.
- Delivery/process docs live under `spark/` (not here).
- Agent pointer: [`spark/agents/common/conventions.md`](../../spark/agents/common/conventions.md).

## Index

| ADR | Topic |
|---|---|
| [0001-schema-migrations.md](0001-schema-migrations.md) | Schema ownership and migration runner |
| [0002-api-http-contract.md](0002-api-http-contract.md) | API HTTP contract (RFC 9457 Problem Details, validation status) |
| [0003-better-auth.md](0003-better-auth.md) | Better Auth (sessions + managed keys) |
| [0004-platform-facade-mcp.md](0004-platform-facade-mcp.md) | Platform facade for API + MCP |
| [0005-worker-pg-boss.md](0005-worker-pg-boss.md) | Worker jobs with pg-boss (**superseded** by 0007) |
| [0006-search-knowledge-graph.md](0006-search-knowledge-graph.md) | Search / knowledge graph (AGE + Typesense + api facade) |
| [0007-worker-schedule-not-pg-boss.md](0007-worker-schedule-not-pg-boss.md) | Worker v1: Nest `@nestjs/schedule` + Postgres work state |
| [0008-chat-service-app.md](0008-chat-service-app.md) | Dedicated `apps/chat` owns LLM; web is client |
