# Scaffolder project rules (template)

Copy to the **target** repo as `spark/agents/scaffolder/rules/project.md`.

## Mode

- Sync everything that applies to **existing, non-excluded** components + project tooling/process.
- **update** delivers as **PR** (hub worker always opens a PR for drift sync).
- **Skip** only what is listed under exclusions (or has no matching component).

## Project-wide (root tooling + process) — sync when present

- Package manager / workspace / Turborepo
- Node `engines` / `.nvmrc`
- Root TypeScript / Oxlint / Oxfmt / Vitest pins
- Generate scripts + `spark/generators` stages (types/api/drizzle/erd/…) when the target already uses that pipeline
- Portable `generators:` profile keys; keep local `out_dir` / schema SoT / categories unless rules say otherwise

## Global exclusions — skip

<!--
- Storybook / apps/storybook
- MCP / apps/mcp
- …
-->

## Alternate handling

Optional notes (paths to preserve, naming). Prefer exclusions over a separate ask flow.
