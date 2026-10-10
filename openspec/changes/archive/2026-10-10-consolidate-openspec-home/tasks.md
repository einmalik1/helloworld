# Tasks

## 1. Custom OpenSpec schema

- [x] 1.1 Copy/vendor community `spec-driven-with-adr` into `openspec/schemas/` (repo-local copy of ADR workflow; do not reinvent ADR) and verify `openspec schema validate <name>` passes for the base
- [x] 1.2 Add new OpenSpec artifact types `data-model` and `design-system` to that schema (schema.yaml entries + templates + instructions → durable `openspec/data-model/` and `openspec/design-system/`; keep/adapt ADR → `openspec/decisions/`) and verify schema validate still passes
- [x] 1.3 Set `openspec/config.yaml` `schema:` to the new schema name and verify `openspec status --change consolidate-openspec-home` still resolves

## 2. Move product SoTs into openspec

- [x] 2.1 Move `spec/erd/` → `openspec/data-model/` (including `schema.sql` and `generated/`) and verify the tree exists at the new path
- [x] 2.2 Move `spec/decisions/` → `openspec/decisions/` and verify ADRs 0001–0006 are present
- [x] 2.3 Move `spec/architecture.md`, `spec/tech-stack.md`, `spec/tech-stack-todo.md`, `spec/features/` into `openspec/` and verify files resolve
- [x] 2.4 Scaffold `openspec/design-system/README.md` (stub is enough) and verify the directory is non-empty
- [x] 2.5 Remove or replace Root-`spec/` with a short redirect README (no parallel SoT) and verify no duplicate `schema.sql` under Root-`spec/`

## 3. Retarget generators and references

- [x] 3.1 Update `spark/repo-profile.yaml` generator paths from `spec/erd/…` to `openspec/data-model/…` and verify `rg 'spec/erd' spark/repo-profile.yaml` is empty
- [x] 3.2 Update docs/agent pointers (`agents.md`, `spark/README.md`, `spark/generators/README.md`, documenter rules, packages READMEs as needed) and verify `rg 'spec/erd|spec/decisions' --glob '!openspec/changes/**'` shows no stale product-home references (allow archive history)
- [x] 3.3 Run `pnpm generate` (or documented generate scripts) and verify ERD/types outputs land under `openspec/data-model/generated/`
- [x] 3.4 Refresh `openspec/README.md` map if any final paths differ and verify it matches the on-disk tree

## 4. Delivery process under spark

- [x] 4.1 Add `spark/process/requirements.md`, `ci-cd.md`, and `operations.md` (lean runbooks: requirements→change, CI/CD home, Coolify ops) and verify the three files exist
- [x] 4.2 Retire `spark/plans/` as active tracker (move backlog content into a note under `openspec/changes/` or Issues pointer; archive or delete plans) and verify `spark/agents/common/multi-agent-delivery.md` no longer treats `spark/plans/` as primary
- [x] 4.3 Update `spark/README.md` table for `process/` and verify it states product SoTs live under `openspec/`

## 5. Integration check

- [x] 5.1 Run `openspec validate consolidate-openspec-home` and verify it passes
- [x] 5.2 Confirm capability inventory still lists domain + schema-migrations specs and that delta paths match moved DDL (`openspec show schema-migrations --type spec` still readable)

## Workflow follow-up

- Archive the change after review so deltas merge into main specs (`product-spec-home` created; path updates applied).
- Later product Changes may use the new schema artifacts (`adr`, `data-model`, `design-system`) as needed.
