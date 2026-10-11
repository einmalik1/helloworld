/**
 * @helloworld/platform — in-process application facade for apps/api and apps/worker.
 *
 * External clients (web/cli/tui/mcp) use HTTP → apps/api (api-client or fetch), not engine SDKs.
 */

export const PLATFORM_PACKAGE = "@helloworld/platform" as const;

export * from "./search-graph/index.js";
