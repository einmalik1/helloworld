## Why

Wave C needs product-facing import/export: API starts runs, worker processes files from object storage, clients observe status. `#46` (S3 adapter) and `#47` (worker jobs) are done; without impex the catalog still has no bulk load/extract path.

## What Changes

- Add durable `impex_run` rows (platform schema) linked to worker `job` rows.
- Nest `ImpexModule` on `apps/api`: upload slot (API→S3 put), start import/export (`202`), list/get run status, download export artifacts (auth required).
- Worker impex job handler (`@nestjs/schedule`): claim queued impex jobs, read/write object storage, apply/export domain rows, update run + job terminal state.
- Wire `ObjectStorageModule` + `S3_*` into `apps/worker`.
- End-to-end spike for **`person`** (JSON format): import upsert-by-email + export write artifact.
- Package smoke covering API impex routes (auth gate) and worker impex job wiring (mocked storage/DB where needed).

## Capabilities

### New Capabilities

- (none — `impex` already exists under `openspec/specs/impex/`)

### Modified Capabilities

- `impex`: Pin concrete API paths, run observability, object-storage file I/O via worker, and `person` JSON E2E as the template spike resource.

## Impact

- Primary: `apps/api` (ImpexModule), `apps/worker` (impex job + ObjectStorage), `packages/modules` (`impex_run` Drizzle + migration), light README / katalog notes.
- Consumes: existing `job`/`outbox`, `ObjectStorageModule`, Better Auth, `@helloworld/types` person Zod.
- Does **not**: CLI/TUI impex UX, MCP tools, CSV formats beyond stub rejection, remaining catalog resources, Coolify Application create, reopen ADRs 0001–0008, or add presigned-URL SDK (upload via authenticated API put).
