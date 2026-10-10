# Proposal

## Why

After merging `origin/main` into the openspec consolidation, several product decisions live in `tech-stack.md` / architecture / folded ADRs but **conflict with or are missing from** capability specs and older ADRs (notably worker job model and search engines). Agents cannot “gerade ziehen” until one SoT wins per topic.

## What Changes

- Align **worker job model** with merged tech-stack: Nest `@nestjs/schedule` + outbox/jobs in-process for v1; **supersede** pg-boss-as-default ADR/spec language (no Redis either way).
- Align **search/knowledge-graph** capability with ADR **0006**: Apache AGE on Postgres + Typesense + API facade (`/graph/*`, `/search`) + async worker sync + Cytoscape consumes API JSON only.
- Extend **local-dev-runtime** and **coolify-test-env** for Typesense + AGE-enabled Postgres image / `TYPESENSE_*` env.
- Tighten **api-http-contract** (or nest security notes) for **`x-request-id`** correlation on Problem Details (already in tech-stack).
- Seed **`openspec/design-system/`** baseline: shadcn/ui + Tailwind 4, driver.js tours, Cytoscape as graph viz consumer (not a second data API).
- Fix stale ADR links (`0004-search-…` → `0006`, problem-details filename pointers) in tech-stack-todo / tech-stack.
- Update **impex** / feature prose that still mandatorily name pg-boss if the worker model changes.

**Out of scope:** Implementing AGE image, Typesense Coolify wiring, Cytoscape UI, or Chat/LLM service (follow-up change). No domain DDL changes expected.

## Capabilities

### New Capabilities

- (none — design-system baseline is a durable SoT under `openspec/design-system/`, not a new behaviour capability)

### Modified Capabilities

- `worker-jobs`: Replace pg-boss-as-required with schedule/outbox durable-enough job model per tech-stack v1; keep API `202` + worker ownership of heavy work.
- `search-knowledge-graph`: Normative AGE + Typesense + facade routes + async sync (match ADR 0006).
- `local-dev-runtime`: Compose/env MUST cover Typesense and AGE Postgres stand-in intent.
- `coolify-test-env`: Test plane MAY/MUST record Typesense (and AGE image pin) alongside Postgres/Garage when search is in scope for test — at minimum document profile expectations.
- `api-http-contract`: Add request correlation (`x-request-id` → logs + Problem Details).
- `impex`: Decouple from pg-boss naming; depend on `worker-jobs` job model.

## Impact

- **Touched:** capability specs above; ADR supersession for worker (new ADR under `openspec/decisions/`); `openspec/design-system/`; link cleanup in `openspec/tech-stack.md` / `tech-stack-todo.md`; possibly `openspec/features/impex.md`.
- **Does not change:** runtime apps implementation in this change (docs/spec alignment first); Chat server (later change).
- **Unlocks:** Wave implementation without conflicting SoTs; Chat change can build on a consistent platform story.
