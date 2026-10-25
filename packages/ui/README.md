# `@helloworld/ui`

Shared presentational React components for `apps/web` and `apps/storybook`.

**SoT for UI:** components live here. Storybook hosts stories only; web wires data/navigation.

Emit: `tsc` → `dist/` — see [`openspec/tech-stack.md`](../../openspec/tech-stack.md#build--emit-contract). Consumers import `@helloworld/ui`, not app-local copies.

```bash
pnpm run --filter @helloworld/ui build
pnpm run --filter @helloworld/storybook dev
```
