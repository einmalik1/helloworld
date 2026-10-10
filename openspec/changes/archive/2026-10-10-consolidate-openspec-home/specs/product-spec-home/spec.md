# Spec Delta

## Purpose

Defines where durable product sources of truth live in the repository and how product work is tracked versus delivery/process documentation.

## ADDED Requirements

### Requirement: Product SoTs live under openspec
Durable product definitions MUST live under `openspec/`: capability specs in `openspec/specs/`, data model (including `schema.sql` and generated ERD/entity artifacts) in `openspec/data-model/`, product ADRs in `openspec/decisions/`, design-system contracts in `openspec/design-system/`, plus architecture and tech-stack documents at the `openspec/` root (or documented equivalents under that tree). Root-`spec/` MUST NOT remain a parallel product home after this capability is archived.

#### Scenario: Agent looks up DDL SoT
- **WHEN** an agent needs the authoritative domain DDL path
- **THEN** it uses `openspec/data-model/schema.sql` (not `spec/erd/schema.sql`)

#### Scenario: Agent looks up product ADRs
- **WHEN** an agent needs current architecture decisions for the product
- **THEN** it reads ADRs under `openspec/decisions/`

### Requirement: Product work tracked as OpenSpec changes
In-flight product work MUST be represented as changes under `openspec/changes/`, with completed work under `openspec/changes/archive/`. `spark/plans/` MUST NOT be the primary tracker for active product implementation work after this capability is archived.

#### Scenario: New product feature starts
- **WHEN** a product behavior or structure change is started
- **THEN** a change folder exists under `openspec/changes/<name>/` before implementation tasks are applied

### Requirement: Delivery process stays under spark
Delivery, agent process, Coolify profile, generators, and CI/CD/ops runbooks MUST live under `spark/` (and root `agents.md` pointers), not as product capability specs that duplicate those runbooks. Process-only changes MAY use an OpenSpec change for work tracking but MUST durable-write under `spark/` and MUST NOT invent parallel product SoTs for the same facts.

#### Scenario: Generator pipeline docs updated
- **WHEN** how types are generated from the data model changes
- **THEN** durable process/tooling documentation and generator config are updated under `spark/`, while the DDL SoT remains under `openspec/data-model/`
