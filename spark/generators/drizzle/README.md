# drizzle stage

Reads `schema-model.json` and writes domain Drizzle TypeScript under
`generators.drizzle.out_dir` (default `packages/modules/src/database/schema/`).

Auth tables are **not** produced here — Better Auth CLI owns
`packages/modules/src/database/auth-schema.ts`.

```bash
pnpm generate:drizzle
# or
python3 spark/generators/run.py --only drizzle
```
