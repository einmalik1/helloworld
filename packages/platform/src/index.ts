/**
 * @helloworld/platform — in-process application facade for apps/api and apps/mcp.
 *
 * Domain use-cases live here. Nest controllers and MCP tools stay thin.
 * External clients (web/cli/tui) use @helloworld/api-client instead.
 */
export const PLATFORM_PACKAGE = "@helloworld/platform" as const;

export {
  createPerson,
  deletePerson,
  getPerson,
  listPersons,
  updatePerson,
  isUniqueViolation,
  type CreatePersonInput,
  type ListPersonsQuery,
  type ListPersonsResult,
  type PersonError,
  type PersonRecord,
  type PersonStore,
  type UpdatePersonInput,
} from "./person/index.js";
