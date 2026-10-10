# Tasks

## 1. ADRs and indexes

- [x] 1.1 Ensure `openspec/decisions/0007-worker-schedule-not-pg-boss.md` is present and listed in `openspec/decisions/README.md` index; verify README links resolve
- [x] 1.2 Add a one-line superseded note pointer on ADR 0005 file header only if project convention allows without editing accepted body — otherwise leave 0005 untouched and rely on 0007 Supersedes; verify 0007 `Supersedes` field names 0005

## 2. Capability alignment (docs already drafted in change deltas — apply via archive sync; verify sources)

- [x] 2.1 Update `openspec/features/impex.md` queue wording to match schedule/Postgres work-state (no mandatory pg-boss); verify file no longer requires pg-boss
- [x] 2.2 Fix stale links in `openspec/tech-stack.md` and `openspec/tech-stack-todo.md` (`0004-search-…` → `0006`, problem-details filename text → `0002-api-http-contract`); verify `rg '0004-search|api-problem-details' openspec/` is empty (except archive history)

## 3. Design system + runtime docs

- [x] 3.1 Expand `openspec/design-system/README.md` with shadcn/Tailwind, driver.js, Cytoscape-via-API baseline; verify sections exist
- [x] 3.2 Confirm `.env.example` documents `TYPESENSE_*` (add if missing) and compose/docs mention Typesense + AGE Postgres; verify keys present
- [x] 3.3 Update `spark/process/operations.md` and/or `local-dev` notes to mention Typesense alongside Postgres/Garage; verify process doc references Typesense

## 4. Validation

- [x] 4.1 Run `openspec validate align-main-merge-gaps` and verify it passes
- [x] 4.2 Run `openspec list --specs` and spot-check that worker-jobs / search-knowledge-graph purposes still read until archive merges deltas

## Workflow follow-up

- Archive after review so deltas merge into main specs.
- Later: apply/archive `add-chat-service` after this change is archived.
