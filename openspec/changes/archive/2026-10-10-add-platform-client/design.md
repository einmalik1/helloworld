# Design

## Context

See `proposal.md` for motivation. Existing packages: `types` (Zod), `modules` (Nest infra), `api-client` (HTTP for external clients), `terminal`, `config`. `packages/README.md` already says MCP must not use `api-client` as MCP transport. Multi-agent / Coolify-test discussion settled on API + MCP as the stable outer facade; engines stay swappable behind a shared in-process layer.

## Goals / Non-Goals

**Goals:**

- Introduce `@helloworld/platform` with correct emit contract and docs.
- Lock consumer/non-consumer rules and dependency direction.
- Leave a clear place for future use-cases (domain, impex, search/graph).

**Non-Goals:**

- Implement real use-cases or engine SDKs.
- Wire Nest providers or MCP tools in this change.
- Change `@helloworld/api-client` behaviour.
- Resolve #16 engine picks (Neo4j vs …).

## Decisions

### 1. New package `packages/platform` named `@helloworld/platform`

- **Why:** Distinct from Nest plumbing (`modules`) and HTTP SDK (`api-client`).
- **Alternatives:** Stuff domain into `modules` — rejected; mixes infra with application facade. Put use-cases only in `apps/api` and import from MCP — rejected; couples MCP to the API app.

### 2. MCP and API call platform in-process

- **Why:** One business implementation; stack swaps stay behind adapters.
- **Alternatives:** MCP → HTTP → API only — allowed later if process isolation is required; not the template default.

### 3. Depend on `@helloworld/types` only for now

- **Why:** Scaffold needs Zod shapes eventually; no DB/S3 deps until a later change.
- **Alternatives:** Zero deps — acceptable but types will be needed immediately when first use-case lands; adding `workspace:*` types now is cheap.

### 4. `modules` stays Nest infra; may import platform later

- **Why:** Controllers/guards in apps or thin Nest wrappers in modules can inject platform services later without platform importing Nest.
- **Rule:** `platform` MUST NOT depend on `@nestjs/*` in this scaffold (keeps MCP-usable without Nest).

### 5. Doc updates in packages README + tech-stack inventory row

- **Why:** Discoverability for agents; matches how other packages are listed.

### Dependency sketch (after this change)

```text
packages/config
       ^
packages/types
       ^
       ├── packages/platform   --> apps/api, apps/mcp
       ├── packages/modules    --> apps/api (+ may use platform later)
       ├── packages/terminal   --> tools/*
       └── packages/api-client --> tools/*, apps/web
```

## Risks / Trade-offs

- **[Risk] Empty package looks “unused”** → Mitigation: README states purpose and next waves; OpenSpec capability records the contract.
- **[Risk] Logic still lands in controllers** → Mitigation: later changes/tasks require use-cases in platform; agent rules can point here.
- **[Risk] Name clash with “bootstrap-platform”** → Mitigation: change id `add-platform-client`; package name `platform` is the product term.

## Migration Plan

1. Add package + build wiring (Turbo picks it up via workspace scripts).
2. Update docs.
3. Later changes: first real use-case (e.g. health/db ping or person CRUD) moves into platform when API is scaffolded.

## Open Questions

- None blocking scaffold. Nest DI registration style (custom provider vs modules wrapper) deferred to the first API wave.
