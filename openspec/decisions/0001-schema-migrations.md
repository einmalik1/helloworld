# 0001 — Schema migrations

## Status

Accepted (spec-baseline)

## Context

Domain DDL lives in `openspec/data-model/schema.sql`. We need a path to running Postgres that stays reviewable and does not invent schema at process boot.

## Decision

- **`openspec/data-model/schema.sql`** remains the DDL source of truth for domain tables.
- Runtime schema is applied with **`drizzle-kit migrate`** (Drizzle schema under `packages/modules`, aligned with SQL — generate or hand-sync documented in modules README).
- Better Auth tables join the **same** migrate path (CLI generate → Drizzle → migrate).
- Local and Coolify use the **same** migrate command surface.

## Consequences

- Deploy/boot docs must run migrations before serving traffic.
- Agents must not add `CREATE TABLE` in `onModuleInit`.

## Rejected

- Runtime DDL (`CREATE TABLE IF NOT EXISTS` / idempotent `ALTER` on boot) from prior Nest projects.
