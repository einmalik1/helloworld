import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Logger } from "pino";

import type { ApiClient } from "./api-client.js";
import type { McpConfig } from "./configuration.js";
import { createMcpServer } from "./tools.js";

export type McpHttpApp = ReturnType<typeof createMcpExpressApp>;

export function createHttpApp(options: {
  config: McpConfig;
  api: ApiClient;
  logger: Logger;
}): McpHttpApp {
  const { config, api, logger } = options;
  const app = createMcpExpressApp({ host: config.MCP_HOST });

  app.post("/mcp", async (req, res) => {
    const server = createMcpServer(api);
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      logger.error({ err: error }, "MCP request failed");
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });

  app.delete("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  return app;
}
