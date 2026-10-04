# Architecture

System picture and component boundaries for Hello World — technology-agnostic.

Keep it factual. Chosen technologies live in [`tech-stack.md`](tech-stack.md). Rationale for contested choices lives in [`decisions/`](decisions/).

## Components

See root `README.md` for the layout inventory (`apps/`, `tools/`, `infra/`, `tests/`, `spark/`, `packages/`).

## Configuration boundary

Runtime configuration for all services and tools is a **single repo-root env file** (sectioned by component). Components validate only the keys they need; they do not each own a private env file. Details: root `README.md` (Environment) and [`tech-stack.md`](tech-stack.md#root-environment).

## Data model

Authoritative DDL: [`erd/schema.sql`](erd/schema.sql).  
Regenerate: `pnpm generate` (or `pnpm generate:erd`) — Python generators under `spark/generators/`, config in `spark/repo-profile.yaml` → [`erd/generated/`](erd/generated/).

## Related

| Doc | Role |
|---|---|
| [`tech-stack.md`](tech-stack.md) | Tech stack inventory |
| [`features/`](features/) | Behaviour / acceptance |
| [`decisions/`](decisions/) | ADRs |
| Root `CONTEXT.md` | Ubiquitous language |
