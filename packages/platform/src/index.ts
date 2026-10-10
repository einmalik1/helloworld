/**
 * @helloworld/platform — in-process application facade for apps/api and apps/mcp.
 *
 * Domain use-cases live here; Nest controllers and MCP tools call them in-process.
 */
export const PLATFORM_PACKAGE = "@helloworld/platform" as const;

export {
  createGreeting,
  deleteGreeting,
  getGreeting,
  listGreetings,
  updateGreeting,
} from "./greeting/index.js";
export type { ListGreetingsPage, ListGreetingsQuery } from "./greeting/index.js";
