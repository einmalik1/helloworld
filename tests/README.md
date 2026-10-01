# tests

System-wide tests against running services and tools. Unit tests live next to code under `apps/`, `packages/`, and `tools/`.

| Suite | Path | Focus |
|---|---|---|
| e2e | `tests/e2e` | Web UI, screenshots and HTML baselines (checked in) |
| api | `tests/api` | REST interface |
| mcp | `tests/mcp` | MCP protocol and tools |
| worker | `tests/worker` | Jobs and side effects |
| cli | `tests/cli` | CLI against running services |
| tui | `tests/tui` | Terminal interaction |

## Local prerequisites

Most suites expect services already running (see root [Local development](../README.md#local-development)):

| Suite | Needs up |
|---|---|
| `tests/api` | `api` + Postgres (+ S3 for file endpoints) |
| `tests/e2e` | `web` + `api` + Postgres (+ S3 when flows upload) |
| `tests/worker` | `worker` + Postgres (+ S3 when jobs use storage) |
| `tests/cli` / `tests/tui` | target services those tools call |
| `tests/mcp` | `mcp` (+ backends it proxies) |

Framework details live in each suite README when wired.
