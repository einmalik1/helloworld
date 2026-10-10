## Context

Coolify test Garage (`garage_uuid: wkcfjdulstfgbjcrmndvygup`) is provisioned; local MinIO stand-in and `.env.example` `S3_*` already exist. `@helloworld/platform` is still a placeholder; `@helloworld/modules` has Database/Auth/Health but no object-storage module. Ticket `#46` / backlog: platform S3 adapter + Coolify test Garage wiring (`packages/modules` + env). Do not re-open facade ADRs 0001–0006.

In-force ADRs reviewed: **0001** (no runtime DDL), **0002** (Problem Details — filter may map StorageError later), **0003** (Better Auth — unrelated), **0004** platform facade (engine adapters behind platform), **0005–0008** (worker/search/chat — out of scope except that worker will consume this module later).

## Goals / Non-Goals

**Goals:**

- Platform S3 adapter (`@aws-sdk/client-s3` **3.1144.0** + `neverthrow` **8.2.0**) with put/get/delete/head against default bucket from `S3_*`.
- Nest `ObjectStorageModule` in modules that builds the adapter from `ConfigService` `S3_*` keys and exports an injectable service.
- Shared `s3EnvSchema` (or equivalent Zod fragment) for apps that touch storage; wire optional/required keys into `apps/api` only if the API boots the module in this change — prefer modules-level helper + document; import module into api when smoke needs it, or keep api import optional until impex.
- Document Coolify test Garage → `S3_*` in `spark/repo-profile.yaml`; ensure Garage service is startable.
- Smoke: modules DI resolves ObjectStorage; platform typecheck/build (+ light adapter unit test with mocked client or local MinIO if up).

**Non-Goals:**

- Impex HTTP / worker job handlers (`#47`, `#48`).
- Presigned URL product flows (MAY add a thin `getPresignedGetUrl` helper if trivial; not required for acceptance).
- CLI/web S3 credentials; Coolify Application create; schema/migrations.
- Re-opening ADRs 0001–0006; new durable ADR unless design forces one (prefer none).

## Decisions

1. **Layering (ADR 0004):**
   - `@helloworld/platform`: `createS3ObjectStorage(config)` / `S3ObjectStorage` implementing put/get/delete/head → `Result`. No Nest imports. SDK dependency lives here.
   - `@helloworld/modules`: `ObjectStorageModule` + `ObjectStorageService` that reads `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_FORCE_PATH_STYLE` and holds the platform adapter; export token/service for injection.
   - Apps import `ObjectStorageModule` when they need storage (api/worker). This change wires modules + documents env; **api AppModule imports ObjectStorageModule** only if we add S3 keys to api `envSchema` — yes, include optional-or-required S3 keys so Coolify test / local can boot with storage ready for impex.

2. **Config:** Export `s3EnvFields` Zod shape from modules (or a small `object-storage/s3-env.ts`) that apps merge into their `envSchema`. Local defaults match `.env.example` (path-style true). Coolify Garage: path-style **true**, region `garage` or `us-east-1` (SDK requires a region string; Garage ignores), endpoint = `GARAGE_S3_API_URL`, bucket = `GARAGE_DEFAULT_BUCKET` (`default`), keys from `SERVICE_USER_GARAGE` / `SERVICE_PASSWORD_64_GARAGE`. **Never commit secret values** — profile documents the mapping only.

3. **Errors:** Add `StorageError` to `@helloworld/types` (500-class, like DatabaseError). Missing object → `NotFound`. Map `StorageError` in api exception filter for consistency (small additive change).

4. **Force path style:** Parse `S3_FORCE_PATH_STYLE` as boolean (`true`/`false` strings); default `true` for local MinIO and Garage.

5. **Verification:** `pnpm --filter @helloworld/platform typecheck && build`; `pnpm --filter @helloworld/modules typecheck && build && smoke` (extend nest-di smoke with ObjectStorageModule + env); api typecheck/build/smoke if AppModule/envSchema touched. Live Garage/MinIO round-trip is nice-to-have; DI + mocked client unit test is enough for green smoke if storage is down.

6. **Garage lifecycle:** If Coolify test Garage is `exited`, start it as part of wiring verification; do not run Compose on the Coolify host.

## Risks / Trade-offs

- **[Risk] Garage exited / unreachable from agent network** → Mitigation: document mapping; smoke uses DI + optional skip of live put/get; local MinIO for laptop happy path.
- **[Risk] Committing secrets into profile** → Mitigation: map env var *names* and public endpoint/bucket only.
- **[Trade-off] S3 required in api envSchema now** → Prefer required when ObjectStorageModule is imported globally; if that breaks existing smoke without S3 env, set smoke defaults from `.env.example` (same pattern as DATABASE_URL).
- **[Trade-off] Presign deferred** → Impex can add `@aws-sdk/s3-request-presigner` later.

## Migration Plan

1. Land platform adapter + modules module + profile docs on automation branch; merge via PR.
2. Operators set `S3_*` on Coolify apps from Garage service env when api/worker deploy.
3. Rollback: remove ObjectStorageModule import / platform adapter exports; no SQL migration.

## Open Questions

- None blocking. Bucket name for Coolify is Garage `default` vs local `helloworld` — apps use `S3_BUCKET` so both work without code branches.
