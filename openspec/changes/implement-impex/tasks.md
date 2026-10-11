## 1. Data model + migrate

- [x] 1.1 Add `impex_run` Drizzle table (platform); export from `schema-entry`; document in modules README + nicht-crud katalog
- [x] 1.2 Create migration via `pnpm db:generate`; typecheck/build `@helloworld/modules`

## 2. API ImpexModule

- [x] 2.1 Implement ImpexModule (repository/service/controller): uploads, start import/export (`202`), list/get runs, download; wire into AppModule
- [x] 2.2 Reject unauthenticated impex calls; unsupported resource/format → 400 Problem Details; person+json supported

## 3. Worker impex jobs

- [x] 3.1 Wire ObjectStorageModule + `s3EnvFields` into worker AppModule / `envSchema`
- [x] 3.2 Implement ImpexJob `@Interval`: claim queued `impex.*` jobs; person JSON import (upsert email) + export; update job + impex_run
- [x] 3.3 Extend JOB_TYPE constants; ensure operator retry re-queues impex jobs

## 4. Verification

- [x] 4.1 Extend api + worker smoke for impex auth gates / job wiring (mocked storage/DB as needed)
- [x] 4.2 Run typecheck + build + smoke for touched packages; fix until green
