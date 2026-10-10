# Design

## Context

See proposal.md — Why. Today: product docs split between Root-`spec/` and `openspec/`; generators and many docs cite `spec/erd/`; work tracker still `spark/plans/`; OpenSpec schema is stock `spec-driven` (no ADR / data-model / design-system artifacts). `openspec/README.md` already describes the target map.

## Goals / Non-Goals

**Goals**
- One product home under `openspec/`; one delivery home under `spark/`.
- Project-local schema that can produce ADR, data-model, and design-system artifacts on future changes.
- Path retarget so `pnpm generate` and capability specs agree on `openspec/data-model/schema.sql`.

**Non-Goals**
- Full design-system content or CI pipeline implementation.
- Changing ADR 0001–0006 decisions (paths/links only).
- Domain feature Waves.

## Decisions

1. **Schema:** **Copy** community `spec-driven-with-adr` into `openspec/schemas/` (repo-local; nicht ADR von null bauen). Dann Artifacts **`data-model`** und **`design-system`** ergänzen (Templates + Instructions). Schema-id z.B. `spec-driven-product`. `config.yaml` darauf zeigen.
2. **ADR durable path:** Write product ADRs to `openspec/decisions/` via schema instructions + change-local ADR manifest. Do **not** rely on OpenSpec `folder:` under `openspec/` (CLI forbids that prefix); Root-`adr/` rejected so product stays one tree.
3. **Data-model move:** `spec/erd/` → `openspec/data-model/` (keep `schema.sql` + `generated/` layout). Update `spark/repo-profile.yaml` generator paths in the same apply.
4. **Delivery docs:** Add `spark/process/` (`requirements.md`, `ci-cd.md`, `operations.md`) describing process; retire `spark/plans/` as tracker (migrate backlog pointer into `openspec/changes/` / Issues / archive note).
5. **Existing README:** Treat `openspec/README.md` as the canonical map; refresh during apply if paths drift — do not fork a second map under `spark/`.

## Risks / Trade-offs

- [Broken generator paths mid-move] → Update `repo-profile.yaml` and run `pnpm generate` in the same task group as the directory move.
- [Stale links in apps/docs publishing Root-`spec/`] → Grep and retarget publish roots / README pointers in apply.
- [ADR `folder:` limitation surprises future agents] → Document the instruction-based write to `openspec/decisions/` in schema templates and README.

## Migration Plan

1. Add schema + switch `config.yaml` (validate schema).
2. Move `spec/*` durable trees into `openspec/`; leave a short Root-`spec/README.md` redirect or delete after link sweep.
3. Retarget profile/docs/specs; regenerate ERD/types.
4. Add `spark/process/`; retire plans tracker; update agent pointers.
5. Archive this change so capability deltas merge into main specs.

Rollback: revert the move commit and restore `config.yaml` schema name; generators back to `spec/erd/`.

## Open Questions

None for apply — design-system may start as a stub README only.
