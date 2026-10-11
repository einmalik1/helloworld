/**
 * @helloworld/platform — in-process application facade for apps/api and apps/worker.
 *
 * Engine adapters (Postgres, object storage, search, graph) and domain use-cases
 * live here. External clients (web/cli/tui/mcp) use HTTP → apps/api (api-client or fetch),
 * not engine SDKs.
 */

export const PLATFORM_PACKAGE = "@helloworld/platform" as const;

export {
  createS3ObjectStorage,
  type GetObjectResult,
  type HeadObjectResult,
  type ObjectStorage,
  type ObjectStorageError,
  type PutObjectInput,
  type S3ObjectStorageConfig,
} from "./adapters/s3/index.js";

export * from "./search-graph/index.js";
