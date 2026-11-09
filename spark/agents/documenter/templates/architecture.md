# Architecture

Current system shape. Decision history: [ADR index](./adr/README.md).

## Purpose

One short paragraph: what the system is for and the main architectural stance.

## Context diagram / boundaries

Who talks to whom. External systems, trust boundaries, deployable units.

## Components

| Id | Path | Responsibility |
|----|------|----------------|
| … | … | … |

Link to a component `architecture.md` only where one exists.

## Data and control flow

How primary requests or jobs move through the system. Keep to the happy path plus critical async/error paths.

## Cross-cutting concerns

Auth, tenancy, persistence, messaging, observability, config — only what is structural and current.

## Constraints

Hard rules that implementers must not violate (derived from Accepted ADRs). Link ADRs instead of restating essays.

## Relevant ADRs

| ADR | Title | Why it still shapes the system |
|-----|-------|--------------------------------|
| … | … | … |
