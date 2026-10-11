import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { configureClient, customFetch, fetchHealthFrom } from "./http.js";

describe("api-client x-api-key mutator smoke", () => {
  let server: http.Server;
  let baseUrl: string;
  let lastHeaders: http.IncomingHttpHeaders;

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      lastHeaders = req.headers;
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, path: req.url }));
    });
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => resolve());
    });
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("sets x-api-key when configureClient provides apiKey", async () => {
    configureClient({ apiUrl: baseUrl, apiKey: "smoke-api-key" });
    const body = await customFetch<{ ok: boolean }>("probe");
    expect(body).toEqual({ ok: true, path: "/probe" });
    expect(lastHeaders["x-api-key"]).toBe("smoke-api-key");
  });

  it("omits x-api-key when apiKey is not provided", async () => {
    configureClient({ apiUrl: baseUrl });
    await customFetch("probe");
    expect(lastHeaders["x-api-key"]).toBeUndefined();
  });

  it("fetchHealthFrom probes without mutating global client key", async () => {
    configureClient({ apiUrl: baseUrl, apiKey: "global-key" });
    await fetchHealthFrom(baseUrl, { apiKey: "one-off-key", path: "health" });
    expect(lastHeaders["x-api-key"]).toBe("one-off-key");
    await customFetch("probe");
    expect(lastHeaders["x-api-key"]).toBe("global-key");
  });
});
