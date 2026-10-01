# Log analysis rules (Hello World)

## Apps

Coolify apps will be filled in once deployments exist in `spark/repo-profile.yaml`. Expected candidates:

- **api** — REST backend (errors, 5xx, DB/S3)
- **worker** — job failures and retries
- **web** / **docs** / **storybook** — build and runtime errors (lower priority than api)
- **mcp** — MCP server logs

## Noise (usually ignore)

- Health-check spam (`GET /health` 200)
- Postgres/S3 startup messages during the deploy window

## Tickets

- One issue per distinct finding
- Include Coolify reference and a log excerpt
