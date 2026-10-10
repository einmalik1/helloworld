# Requirements → Change

How product and delivery work enters the repo.

1. Capture intent (issue optional).
2. Open an OpenSpec change under `openspec/changes/<name>/` (`/opsx-propose` or equivalent).
3. Schema **`spec-driven-product`**: proposal → specs → design → adr → (optional data-model / design-system) → tasks.
4. Implement with `/opsx-apply`; archive when done so capability deltas merge into `openspec/specs/`.

**Product SoTs** live under `openspec/` (specs, data-model, decisions, design-system).  
**Process / tooling** durable docs live under `spark/` (this folder, agents, repo-profile, generators).

Process-only changes may use an OpenSpec change for tracking with `skip_specs: true` and write durable outcomes here under `spark/`.
