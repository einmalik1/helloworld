# Architecture

System picture and component boundaries for Hello World — technology-agnostic.

Keep it factual. Chosen technologies live in [`tech-stack.md`](tech-stack.md). Rationale for contested choices lives in [`decisions/`](decisions/).

## Components

See root `README.md` for the layout inventory (`apps/`, `tools/`, `infra/`, `tests/`, `spark/`, `packages/`).

## Data model

Authoritative DDL: [`erd/schema.sql`](erd/schema.sql).  
Regenerate diagrams: `pnpm erd:build` → [`erd/generated/`](erd/generated/).

## Related

| Doc | Role |
|---|---|
| [`tech-stack.md`](tech-stack.md) | Tech stack inventory |
| [`features/`](features/) | Behaviour / acceptance |
| [`decisions/`](decisions/) | ADRs |
| Root `CONTEXT.md` | Ubiquitous language |
