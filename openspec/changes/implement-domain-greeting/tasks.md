## 1. Platform greeting use-cases

- [x] 1.1 Add platform deps (`neverthrow`, `drizzle-orm`, `@helloworld/modules`) and export surface for greeting use-cases
- [x] 1.2 Implement `createGreeting` / `getGreeting` / `listGreetings` (channel_id + page/limit) / `updateGreeting` / `deleteGreeting` with neverthrow Results and typed errors
- [x] 1.3 Add focused Vitest coverage for NotFound and channel filter behaviour (mock or in-memory db handle as practical)

## 2. Nest HTTP feature

- [x] 2.1 Add `@helloworld/platform` dependency on `apps/api`
- [x] 2.2 Implement `GreetingModule` / thin `GreetingService` / `GreetingController` using generated DTOs + hand-written list query DTO; map Results to HTTP (201/204/list envelope)
- [x] 2.3 Import `GreetingModule` in `AppModule`; run `openapi:export`

## 3. Verification

- [x] 3.1 `pnpm --filter @helloworld/platform typecheck && build` and `pnpm --filter api typecheck && build && smoke` green
- [x] 3.2 Mark tasks complete; leave ADRs 0001–0006 untouched
