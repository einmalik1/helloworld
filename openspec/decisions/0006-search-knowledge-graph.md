# 0006 — Search / knowledge graph

## Status

Accepted (spec-baseline) — engine default revisitable

## Context

Need exploration/search over greetings, people, channels, reactions without replacing Postgres. OpenSpec: `search-knowledge-graph`.

## Decision

1. **Postgres remains system of record.** Search/graph is a secondary index; rebuild-from-SoT is allowed.
2. **Access path:** only via **API**, **MCP**, and **`@helloworld/platform`** adapters. No direct engine URLs for web/CLI/TUI.
3. **Sync:** async-capable (worker/outbox/rebuild). Product MUST NOT assume instant index visibility after writes unless a later ADR adds an SLA.
4. **Template engine default:** **Apache AGE** on the same PostgreSQL (ops-light for Coolify/local). If AGE proves unfit in implementation, switch to **Memgraph** behind the same facade without changing client contracts.
5. **v1 scope:** graph traversal + structured search APIs; vector search optional later.

## Consequences

- Component path TBD at impl (`apps/graph` or infra engine + thin app) — facade rules stay.
- Coolify **test** may add the engine later; not required for Wave A–B CRUD.

## Rejected

- Clients talking to the graph engine directly.
- Graph as SoT instead of Postgres.
- Requiring Elasticsearch + Neo4j + Redis together for template v1.
