## 1. Types + platform S3 adapter

- [x] 1.1 Add `StorageError` to `@helloworld/types` (export from package index); typecheck/build types
- [x] 1.2 Add `@aws-sdk/client-s3@3.1144.0` and `neverthrow@8.2.0` to `@helloworld/platform`; implement S3 config + adapter (put/get/delete/head → Result); export from package index
- [x] 1.3 Typecheck + build `@helloworld/platform`

## 2. Modules ObjectStorage + env

- [x] 2.1 Add `@helloworld/platform` dep on modules; implement `s3EnvFields` / ObjectStorageModule + ObjectStorageService; export from modules index; document in modules README
- [x] 2.2 Extend nest-di smoke with ObjectStorageModule + `S3_*` defaults; map `StorageError` in api exception filter; merge S3 keys into api `envSchema` and import ObjectStorageModule in AppModule
- [x] 2.3 Document Coolify test Garage → `S3_*` mapping in `spark/repo-profile.yaml` (no secrets); ensure Garage service can be started

## 3. Verification

- [x] 3.1 Run typecheck/build/smoke for touched packages (`types`, `platform`, `modules`, `api`); fix until green
