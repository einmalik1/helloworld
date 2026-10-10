# Tasks

## 1. Package scaffold

- [x] 1.1 Create `packages/platform` with `package.json` (`@helloworld/platform`, `type: module`, `build`/`typecheck`, `exports` → `dist/`, dep on `@helloworld/types` + `@helloworld/config` / typescript as needed) and verify package is visible to pnpm (`pnpm list --filter @helloworld/platform` or workspace list)
- [x] 1.2 Add `tsconfig.json` extending `@helloworld/config/tsconfig` with `rootDir`/`outDir`, plus minimal `src/index.ts` placeholder surface; verify `pnpm run --filter @helloworld/platform build` creates `packages/platform/dist/` and `typecheck` passes
- [x] 1.3 Confirm `package.json` does not depend on `@helloworld/api-client` or `@nestjs/*`; verify by inspecting dependencies

## 2. Documentation

- [x] 2.1 Write `packages/platform/README.md` covering role, consumers (api/mcp), non-consumers (web/cli/tui → api-client), adapter seam (PG/S3/search/graph), build/emit; verify those points are present in the file
- [x] 2.2 Update `packages/README.md` table and dependency diagram to include `@helloworld/platform`; verify the table row exists
- [x] 2.3 Add a short inventory row (and optional one-line subsection) for `packages/platform` in `spec/tech-stack.md` shared packages; verify the name `@helloworld/platform` appears there

## 3. Integration check

- [x] 3.1 From repo root run `pnpm install` (if needed), `pnpm run build`, and `pnpm run typecheck` and verify `@helloworld/platform` participates successfully via Turbo

## Workflow follow-up

- Archive with `/opsx-archive` after review when implementation is done.
- Later changes: wire first real use-cases; Nest/MCP consume platform in-process.
