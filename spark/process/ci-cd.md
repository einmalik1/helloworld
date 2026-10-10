# CI / CD

Where build, test, and promote live.

| Concern | Home |
|---|---|
| Task graph (dev/build/test/lint) | Root `package.json`, `turbo.json` |
| Pipeline definition | CI config in the repo (e.g. GitHub Actions) — add/extend here as CI lands |
| Environments / deploy targets | `spark/repo-profile.yaml` → Coolify (`test`, `qa`, `production`) |
| Agent/CI integration plane | Coolify **test** (not host `docker:local:*` on the Coolify server) |

Product behaviour of build emit stays in OpenSpec capability `build-emit` / tech-stack. This runbook is **how** we run pipelines, not what the product must do.
