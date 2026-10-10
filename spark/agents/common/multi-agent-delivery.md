# Multi-agent delivery

## Rules

1. **One agent → one OpenSpec change** from [`spark/process/implementation-backlog.md`](../../process/implementation-backlog.md).
2. If the change folder does not exist yet: `/opsx-propose <change-name>` (keep scope to that backlog row), then `/opsx-apply`.
3. **Do not** start Explore loops to revisit ADRs 0001–0006 (migrations, HTTP contract, Better Auth, platform/MCP facade, pg-boss, search access). Propose a new ADR change only if evidence forces it (durable ADRs: `openspec/decisions/`).
4. Integrate against Coolify **test** (`spark/repo-profile.yaml`). Do **not** run `pnpm run docker:local:up` on the Coolify host.
5. Domain logic goes in `@helloworld/platform`; external clients use `@helloworld/api-client` only.
6. Product SoTs: [`openspec/README.md`](../../../openspec/README.md). Process: [`spark/process/`](../../process/).

## Wave order

Respect Wave A → B → C dependencies in the backlog. Parallelize only within a wave (or after stated prerequisites).
