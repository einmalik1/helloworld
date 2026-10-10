/**
 * @helloworld/platform — in-process application facade for apps/api and apps/mcp.
 *
 * Domain use-cases live here. Nest controllers and MCP tools stay thin.
 * External clients (web/cli/tui) use @helloworld/api-client instead.
 */
export const PLATFORM_PACKAGE = "@helloworld/platform" as const;

export {
  createGreetingReaction,
  deleteGreetingReaction,
  getGreetingReaction,
  listGreetingReactions,
  updateGreetingReaction,
  isForeignKeyViolation,
  isUniqueViolation,
  type CreateGreetingReactionInput,
  type GreetingReactionError,
  type GreetingReactionRecord,
  type GreetingReactionStore,
  type ListGreetingReactionsQuery,
  type ListGreetingReactionsResult,
  type UpdateGreetingReactionInput,
} from "./greeting-reaction/index.js";
