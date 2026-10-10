/**
 * @helloworld/platform — in-process application facade for apps/api and apps/mcp.
 *
 * Domain use-cases live here. Nest controllers and MCP tools call these in-process.
 * Engine adapters (Postgres via repository ports, later S3/search/graph) sit behind
 * this surface — external clients use @helloworld/api-client instead.
 */
export const PLATFORM_PACKAGE = "@helloworld/platform" as const;

export {
  createChannel,
  deleteChannel,
  getChannel,
  listChannels,
  updateChannel,
  UniqueSlugError,
} from "./channel/index.js";
export type {
  ChannelError,
  ChannelListQuery,
  ChannelListResult,
  ChannelRecord,
  ChannelRepository,
  CreateChannel,
  UpdateChannel,
} from "./channel/index.js";
