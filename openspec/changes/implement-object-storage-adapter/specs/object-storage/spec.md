## ADDED Requirements

### Requirement: Platform S3 adapter behind facade
`@helloworld/platform` MUST expose an S3-compatible object-storage adapter (using `@aws-sdk/client-s3`) that performs put, get, delete, and head against the configured default bucket, returning neverthrow `Result` values. Callers in Nest apps MUST obtain the adapter via `@helloworld/modules` wiring rather than constructing the AWS SDK in controllers or web/CLI clients.

#### Scenario: Put then get round-trip
- **WHEN** a Nest service puts an object under a key and then gets the same key through the platform adapter
- **THEN** the get Result is ok and the body bytes match what was put

#### Scenario: Missing key is not-found
- **WHEN** a caller gets or heads a key that does not exist
- **THEN** the Result is an err typed as not-found (not an untyped throw)

### Requirement: Nest modules ObjectStorage wiring
`@helloworld/modules` MUST provide an `ObjectStorageModule` (and injectable service) that reads root `S3_*` keys from Nest `ConfigService`, constructs the platform S3 adapter, and exports it for `apps/api` / `apps/worker`.

#### Scenario: DI provides adapter from S3_* env
- **WHEN** a Nest test module imports `ObjectStorageModule` with valid `S3_*` in the env schema
- **THEN** the testing module can resolve the object-storage service / adapter without importing `@aws-sdk/client-s3` in the app feature module

### Requirement: Coolify test Garage S3_* mapping documented
`spark/repo-profile.yaml` MUST document how Coolify **test** Garage maps to app `S3_*` keys (endpoint, region, bucket, path-style, credential source) without committing secret values. Agents MUST be able to resolve test object storage from the profile + Coolify service env.

#### Scenario: Profile points at Garage resource and S3 mapping
- **WHEN** an agent looks up test object storage in `spark/repo-profile.yaml`
- **THEN** `garage_uuid` is present and comments (or adjacent docs) map Garage S3 API URL / default bucket / access keys to `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_REGION`, and `S3_FORCE_PATH_STYLE`

## MODIFIED Requirements

### Requirement: Access through platform or Nest apps
Object storage SDKs MUST be used from `@helloworld/platform` adapters obtained via Nest modules (`@helloworld/modules` ObjectStorage wiring) or Nest apps that own uploads — not from `tools/cli` / `tools/tui` / `apps/web` talking to S3 endpoints directly for product flows.

#### Scenario: CLI downloads via API
- **WHEN** a CLI user downloads an export artifact
- **THEN** the client calls the product API (api-client), which authorizes and provides download access, rather than embedding Garage credentials in the CLI

#### Scenario: Nest uses modules-provided adapter
- **WHEN** `apps/api` or `apps/worker` needs to read or write an object
- **THEN** it injects the modules ObjectStorage service backed by the platform S3 adapter, not a hand-rolled S3 client in a controller
