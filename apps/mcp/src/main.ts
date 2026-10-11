import { createApiClient } from "./api-client.js";
import { loadConfig } from "./configuration.js";
import { loadRootEnv } from "./load-env.js";
import { createLogger } from "./logger.js";
import { createHttpApp } from "./server.js";

loadRootEnv();

const config = loadConfig();
const logger = createLogger(config);
const api = createApiClient({
  baseUrl: config.API_URL,
  apiKey: config.MCP_SERVICE_API_KEY,
});
const app = createHttpApp({ config, api, logger });

const server = app.listen(config.MCP_PORT, config.MCP_HOST, () => {
  logger.info(
    { host: config.MCP_HOST, port: config.MCP_PORT, apiUrl: config.API_URL },
    "MCP server listening",
  );
});

function shutdown(signal: string): void {
  logger.info({ signal }, "Shutting down MCP server");
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
