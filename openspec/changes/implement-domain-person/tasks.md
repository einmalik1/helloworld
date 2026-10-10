## 1. Platform Person use-cases

- [x] 1.1 Add `neverthrow` dependency to `@helloworld/platform`; define `PersonStore` port + Person record types aligned with `@helloworld/types`
- [x] 1.2 Implement `createPerson`, `getPerson`, `listPersons`, `updatePerson`, `deletePerson` returning `Result` (`NotFound` / `ValidationError` / `DatabaseError`); export from package index
- [x] 1.3 Typecheck + build `@helloworld/platform`

## 2. DatabaseService Person queries

- [x] 2.1 Add hand-written Person query methods on `DatabaseService` (insert, findById, list with total, update, delete) using generated Drizzle `person` schema
- [x] 2.2 Typecheck + build `@helloworld/modules`

## 3. Nest Person feature module

- [x] 3.1 Add `@helloworld/platform` dependency on `api`; implement `PersonService` adapting `DatabaseService` → `PersonStore` and calling platform use-cases; map `Result` errors to thrown typed errors for the filter
- [x] 3.2 Implement `PersonController` + `PersonModule` (`POST/GET /person`, `GET/PATCH/DELETE /person/:id`, list query DTO, 201/204); import `PersonModule` in `AppModule`
- [x] 3.3 Extend API smoke (or add person smoke) for create→get, duplicate email → 400 Problem Details, missing id → 404 (override auth/DB as needed)
- [x] 3.4 Run `pnpm --filter api typecheck && build && smoke` until green
