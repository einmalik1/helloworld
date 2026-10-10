# Design

## Context

See proposal.md — Why. Merged `main` locked AGE+Typesense+schedule in tech-stack/architecture/ADR-fold, while capability specs and ADR 0005 still describe pg-boss and a generic search engine.

## Goals / Non-Goals

**Goals:** One SoT per topic across specs, ADRs, design-system stub, and stale links.  
**Non-Goals:** Shipping AGE image, Typesense Coolify service, Cytoscape UI, or Chat/LLM (`apps/chat` follow-up).

## Decisions

1. **Worker v1 = `@nestjs/schedule` + Postgres work/outbox state** (matches tech-stack). Supersede ADR 0005 (pg-boss default) with a new ADR; keep Redis rejected.
2. **Search = ADR 0006 content becomes capability requirements** (AGE + Typesense + facade + async sync + Cytoscape-via-API).
3. **Design-system baseline** documents shadcn/Tailwind, driver.js, Cytoscape consumer rules — no full token set required.
4. **Link cleanup** only — no renumbering of existing ADRs 0001–0006 beyond supersession of 0005.
5. **Chat** deferred to a later change (server-side chat component + web client); not in this change.

## Risks / Trade-offs

- [Impex/features still say pg-boss in prose] → Update `openspec/features/impex.md` in tasks.
- [Operators expected pg-boss] → New ADR states consequences and rejected return to Redis/pg-boss-for-v1.

## Migration Plan

1. Write superseding worker ADR + change-local `adr.md`.
2. Apply spec deltas; seed design-system README; fix links.
3. Archive so main specs merge.

## Open Questions

None for apply — Chat scoped out.
