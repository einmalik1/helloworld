import { describe, expect, it } from "vitest";

import { apiGetJson } from "./api-http.js";

describe("mcp smoke", () => {
  it("builds API URLs against product api paths only", async () => {
    const calls: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      calls.push(String(input));
      return new Response(JSON.stringify({ items: [], total: 0 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    try {
      await apiGetJson({ baseUrl: "http://api.example", apiKey: "k" }, "/search", {
        q: "hi",
        types: "greeting",
      });
      expect(calls[0]).toContain("http://api.example/search");
      expect(calls[0]).toContain("q=hi");
      expect(calls.every((u) => !u.includes("8108"))).toBe(true);
      expect(calls.every((u) => !u.includes("typesense"))).toBe(true);
    } finally {
      globalThis.fetch = original;
    }
  });
});
