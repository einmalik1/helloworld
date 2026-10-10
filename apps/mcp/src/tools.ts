import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { ApiError, type ApiClient } from "./api-client.js";

export const MCP_TOOL_NAMES = [
  "person_create",
  "person_list",
  "person_get",
  "person_update",
  "person_delete",
  "greeting_create",
  "greeting_list",
  "greeting_get",
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];

function toolResult(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

function toolError(error: unknown) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
  return {
    isError: true as const,
    content: [{ type: "text" as const, text: message }],
  };
}

/** Register domain tools that proxy to apps/api HTTP routes. */
export function registerDomainTools(server: McpServer, api: ApiClient): void {
  server.registerTool(
    "person_create",
    {
      description: "Create a person via POST /person",
      inputSchema: {
        display_name: z.string().describe("Public name shown next to greetings"),
        email: z.string().email().describe("Unique contact address"),
      },
    },
    async ({ display_name, email }) => {
      try {
        const data = await api.request({
          method: "POST",
          path: "/person",
          body: { display_name, email },
        });
        return toolResult(data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "person_list",
    {
      description: "List persons via GET /person",
      inputSchema: {
        page: z.number().int().min(1).optional().describe("Page number (default 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Page size (default 20)"),
      },
    },
    async ({ page, limit }) => {
      try {
        const data = await api.request({
          method: "GET",
          path: "/person",
          query: { page, limit },
        });
        return toolResult(data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "person_get",
    {
      description: "Get a person by id via GET /person/:id",
      inputSchema: {
        id: z.string().uuid().describe("Person id"),
      },
    },
    async ({ id }) => {
      try {
        const data = await api.request({ method: "GET", path: `/person/${id}` });
        return toolResult(data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "person_update",
    {
      description: "Update a person via PATCH /person/:id",
      inputSchema: {
        id: z.string().uuid().describe("Person id"),
        display_name: z.string().optional().describe("Public name"),
        email: z.string().email().optional().describe("Unique contact address"),
      },
    },
    async ({ id, display_name, email }) => {
      try {
        const body: Record<string, string> = {};
        if (display_name !== undefined) body.display_name = display_name;
        if (email !== undefined) body.email = email;
        const data = await api.request({
          method: "PATCH",
          path: `/person/${id}`,
          body,
        });
        return toolResult(data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "person_delete",
    {
      description: "Delete a person via DELETE /person/:id",
      inputSchema: {
        id: z.string().uuid().describe("Person id"),
      },
    },
    async ({ id }) => {
      try {
        await api.request({ method: "DELETE", path: `/person/${id}` });
        return toolResult({ deleted: true, id });
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "greeting_create",
    {
      description: "Create a greeting via POST /greeting",
      inputSchema: {
        author_id: z.string().uuid().describe("Person who wrote the greeting"),
        channel_id: z.string().uuid().describe("Channel where the greeting appears"),
        message: z.string().describe("Display text of the greeting"),
      },
    },
    async ({ author_id, channel_id, message }) => {
      try {
        const data = await api.request({
          method: "POST",
          path: "/greeting",
          body: { author_id, channel_id, message },
        });
        return toolResult(data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "greeting_list",
    {
      description: "List greetings via GET /greeting",
      inputSchema: {
        page: z.number().int().min(1).optional().describe("Page number"),
        limit: z.number().int().min(1).max(100).optional().describe("Page size"),
        channel_id: z.string().uuid().optional().describe("Filter by channel"),
      },
    },
    async ({ page, limit, channel_id }) => {
      try {
        const data = await api.request({
          method: "GET",
          path: "/greeting",
          query: { page, limit, channel_id },
        });
        return toolResult(data);
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    "greeting_get",
    {
      description: "Get a greeting by id via GET /greeting/:id",
      inputSchema: {
        id: z.string().uuid().describe("Greeting id"),
      },
    },
    async ({ id }) => {
      try {
        const data = await api.request({ method: "GET", path: `/greeting/${id}` });
        return toolResult(data);
      } catch (error) {
        return toolError(error);
      }
    },
  );
}

export function createMcpServer(api: ApiClient): McpServer {
  const server = new McpServer({
    name: "helloworld-mcp",
    version: "0.0.0",
  });
  registerDomainTools(server, api);
  return server;
}
