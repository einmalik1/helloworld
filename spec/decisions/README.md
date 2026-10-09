# Decisions (ADRs)

Architecture Decision Records for this monorepo. This file is the **process** home for when/how we write ADRs. Product inventory stays in [`tech-stack.md`](../tech-stack.md); system shape stays in [`architecture.md`](../architecture.md).

Issue: [#17](https://github.com/einmalik1/helloworld/issues/17) (tech-stack topic **#12**).

## When an ADR is required

Write an ADR when the choice is a **contested product decision** with lasting consequences and rejected alternatives — for example auth model, queue, graph engine, package emit path, dual binary vs dual-mode CLI.

Do **not** write an ADR for every inventory row or routine version bump in `tech-stack.md`. Factual “what/version” belongs in the inventory; “why / consequences / rejected alternatives” belongs here.

Land product ADR *content* when the related topic closes (e.g. #1, #4, #5, #16), not as a bulk dump ahead of those decisions.

## Naming

Files: `NNNN-short-title.md` (four-digit zero-padded sequence, kebab-case title).

Examples: `0001-schema-migrations.md`, `0002-api-problem-details.md`.

Next number = highest existing `NNNN` + 1. Titles describe the decision, not the ticket number.

## Inventory vs ADR

| Home | Holds |
|---|---|
| [`tech-stack.md`](../tech-stack.md) | Factual inventory: technology, version, where it lives |
| This directory | Why we chose it, consequences, rejected alternatives |
| [`architecture.md`](../architecture.md) | Tech-agnostic components and boundaries |

Keep `tech-stack.md` free of long rationale essays. A one-line pointer from an inventory section to an ADR is fine.

## Template

Use this skeleton for new ADRs (English, like the rest of `spec/`):

```markdown
# NNNN — Short title

## Status

Proposed | Accepted | Superseded by NNNN-…

## Context

What forces the decision? Contested options? Link the GitHub issue and any inventory/README anchors.

## Decision

Clear, numbered statements of what we will do.

## Consequences

What becomes easier, harder, or mandatory for implementers and agents.

## Rejected alternatives

| Alternative | Why rejected |
|---|---|
| … | … |
```

## Placement

- **Global ADRs** live only under `spec/decisions/` (this tree). Do not scatter duplicate decision write-ups under `apps/*` or `tools/*`.
- Component READMEs may state local conventions and link here when a contested choice was recorded as an ADR.
- Agent/process pointer: [`spark/agents/common/conventions.md`](../../spark/agents/common/conventions.md).

## Index

| ADR | Topic |
|---|---|
| [0001-schema-migrations.md](0001-schema-migrations.md) | Schema ownership and migration runner |
| [0002-api-problem-details.md](0002-api-problem-details.md) | API error envelope and validation status |
