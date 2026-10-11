import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createServer } from "node:http";
import { z } from "zod";

import { apiGetJson, type ApiHttpConfig } from "./api-http.js";

function envConfig(): ApiHttpConfig & { host: string; port: number } {
  const baseUrl = process.env.BETTER_AUTH_URL ?? process.env.API_URL ?? "http://localhost:3000";
  const apiKey = process.env.MCP_API_KEY ?? process.env.CHAT_DEV_API_KEY ?? "";
  return {
    baseUrl,
    apiKey,
    host: process.env.MCP_HOST ?? "0.0.0.0",
    port: Number(process.env.MCP_PORT ?? "3100"),
  };
}

function createMcpServer(config: ApiHttpConfig): McpServer {
  const server = new McpServer({
    name: "helloworld",
    version: "0.0.0",
  });

  server.tool(
    "search",
    "Full-text search via apps/api GET /search (never Typesense directly)",
    {
      q: z.string(),
      types: z.string().optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ q, types, limit }) => {
      const data = await apiGetJson(config, "/search", {
        q,
        types,
        limit: limit !== undefined ? String(limit) : undefined,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
      };
    },
  );

  server.tool(
    "graph_related",
    "Related entities via apps/api GET /graph/related",
    {
      entityType: z.string(),
      entityId: z.string().uuid(),
    },
    async ({ entityType, entityId }) => {
      const data = await apiGetJson(config, "/graph/related", {
        entityType,
        entityId,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
      };
    },
  );

  server.tool(
    "graph_subgraph",
    "Ego network via apps/api GET /graph/subgraph",
    {
      entityType: z.string(),
      entityId: z.string().uuid(),
      depth: z.number().int().min(1).max(3).optional(),
    },
    async ({ entityType, entityId, depth }) => {
      const data = await apiGetJson(config, "/graph/subgraph", {
        entityType,
        entityId,
        depth: depth !== undefined ? String(depth) : undefined,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(data) }],
      };
    },
  );

  return server;
}

async function bootstrap(): Promise<void> {
  const config = envConfig();
  if (!config.apiKey) {
    console.warn("MCP_API_KEY (or CHAT_DEV_API_KEY) is empty — api calls will 401 until set");
  }

  const server = createMcpServer(config);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);

  const httpServer = createServer(async (req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    await transport.handleRequest(req, res);
  });

  httpServer.listen(config.port, config.host, () => {
    console.log(`mcp listening on ${config.host}:${config.port}`);
  });
}

void bootstrap();
