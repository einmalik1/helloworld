## Why

Wave C needs a shared S3-compatible object-storage seam before impex (#48) and worker jobs (#47) can store import/export artifacts. Coolify test Garage is provisioned (`garage_uuid` in the profile) but apps still have no platform adapter or Nest/env wiring for `S3_*`.

## What Changes

- Add an S3-compatible object-storage adapter in `@helloworld/platform` (`@aws-sdk/client-s3` **3.1144.0**, neverthrow Results) for put/get/delete/head (and optional list) against root `S3_*` config.
- Wire Nest `ObjectStorageModule` / service in `@helloworld/modules` that reads `S3_*` from Nest config and exposes the platform adapter to api/worker.
- Document Coolify **test** Garage → `S3_*` mapping in `spark/repo-profile.yaml` (and confirm `.env.example` / modules README); start/ensure Garage is the test object store — do **not** commit secrets.
- Optional: add `StorageError` (+ NotFound for missing keys) shared typing; package smoke for modules DI + platform typecheck/build.
- Do **not** implement impex HTTP, worker jobs, or re-open facade ADRs 0001–0006.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `object-storage`: Pin platform adapter + Nest modules wiring and Coolify test Garage `S3_*` mapping as normative (baseline was intent-level).

## Impact

- Packages: `@helloworld/platform` (adapter + deps), `@helloworld/modules` (Nest module), optionally `@helloworld/types` (StorageError), `apps/api` envSchema when API boots with storage, `spark/repo-profile.yaml`, docs (modules README / `.env.example` comments).
- Unlocks `#48` impex only together with `#47` worker jobs.
- Out of scope: impex runs, worker job handlers, CLI/web direct S3, new Coolify apps, ADRs 0001–0006 reopen.
