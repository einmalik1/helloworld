/**
 * @helloworld/platform — in-process application facade for apps/api and apps/mcp.
 *
 * Use-cases and engine adapters (Postgres, object storage, search, graph) land here
 * in later changes. External clients (web/cli/tui) use @helloworld/api-client instead.
 */
export const PLATFORM_PACKAGE = "@helloworld/platform" as const;
