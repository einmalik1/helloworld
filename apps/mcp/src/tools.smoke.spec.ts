import { describe, expect, it, vi } from "vitest";

import { createApiClient } from "./api-client.js";
import { createMcpServer, MCP_TOOL_NAMES } from "./tools.js";

describe("MCP domain tools", () => {
  it("registers person and greeting tools", () => {
    const api = createApiClient({
      baseUrl: "http://localhost:3000",
      apiKey: "k",
      fetchImpl: vi.fn() as unknown as typeof fetch,
    });

    const server = createMcpServer(api);
    const registered = (
      server as unknown as { _registeredTools: Record<string, unknown> }
    )._registeredTools;

    expect(Object.keys(registered).sort()).toEqual([...MCP_TOOL_NAMES].sort());
    expect(MCP_TOOL_NAMES).toEqual([
      "person_create",
      "person_list",
      "person_get",
      "person_update",
      "person_delete",
      "greeting_create",
      "greeting_list",
      "greeting_get",
      "search",
      "graph_related",
      "graph_subgraph",
    ]);
  });
});
