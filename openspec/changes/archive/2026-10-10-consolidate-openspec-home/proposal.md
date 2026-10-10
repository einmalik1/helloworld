# Proposal

## Why

Product SoTs are split across Root-`spec/` and `openspec/`, while delivery plans still live under `spark/plans/`. Agents and humans lack one home for product description vs delivery process, and the default OpenSpec schema cannot express ADRs, data-model, or design-system as first-class change artifacts. We lock in the agreed map now so later Waves stop inventing parallel homes.

## What Changes

- **BREAKING (paths):** Move durable product docs from Root-`spec/` into `openspec/` — `data-model/` (from `erd/`), `decisions/`, `architecture.md`, `tech-stack.md`, `features/`; remove Root-`spec/` as a product home.
- Add project-local OpenSpec schema: **copy/vendor** community `spec-driven-with-adr` into `openspec/schemas/`, then **extend** it with artifacts `data-model` and `design-system` (ADR nicht neu erfinden); point `openspec/config.yaml` at it.
- Keep and harden the repo map in `openspec/README.md` (product vs delivery; durable vs implemented).
- Add lean delivery process docs under `spark/process/`; retire `spark/plans/` as the work tracker (active work = `openspec/changes/` + Issues).
- Retarget generator/`repo-profile` paths and all in-repo references from `spec/erd/…` to `openspec/data-model/…`.
- Scaffold empty-or-minimal `openspec/design-system/` so the UI-language home exists.
- Update agent pointers (`agents.md`, multi-agent delivery) to the new layout.

**Out of scope:** Implementing domain CRUD Waves; inventing a full CI pipeline beyond documenting where it will live; rewriting ADRs 0001–0006 content (paths/links only); filling a complete design-system token set.

## Capabilities

### New Capabilities

- `product-spec-home`: Durable product SoTs live under `openspec/` (specs, data-model, decisions, design-system, architecture/tech-stack); product work uses `openspec/changes/`; delivery process stays under `spark/` and is not duplicated as product capabilities.

### Modified Capabilities

- `schema-migrations`: DDL SoT path becomes `openspec/data-model/schema.sql` (was `spec/erd/schema.sql`).
- `domain-person`, `domain-channel`, `domain-greeting`, `domain-greeting-reaction`: Entity shape requirements reference `openspec/data-model/schema.sql` instead of `spec/erd/schema.sql`.

## Impact

- **Touched:** `openspec/` (schema, config, README, new durable dirs), Root-`spec/` (move/delete), `spark/repo-profile.yaml`, `spark/generators` docs, `spark/plans/` (retire), `spark/process/` (new), `agents.md`, `spark/agents/common/multi-agent-delivery.md`, docs that cite old paths, capability specs listed above.
- **Does not change:** Runtime product behavior of apps/packages beyond path/docs/generator config; Coolify UUIDs; ADR decision substance.
- **Unlocks:** Consistent multi-agent Changes with ADR/data-model/design-system artifacts; single product home for Waves A–C.
