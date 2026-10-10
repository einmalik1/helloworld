import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, createApiClient } from "./api-client.js";

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends x-api-key and builds person list URL", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ items: [], total: 0, page: 1, limit: 20 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const api = createApiClient({
      baseUrl: "http://localhost:3000/",
      apiKey: "test-service-key",
    });

    expect(api.buildUrl("/person", { page: 2, limit: 10 })).toBe(
      "http://localhost:3000/person?page=2&limit=10",
    );

    await api.request({ method: "GET", path: "/person", query: { page: 1 } });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("http://localhost:3000/person?page=1");
    expect(init).toMatchObject({
      method: "GET",
      headers: expect.objectContaining({
        "x-api-key": "test-service-key",
        accept: "application/json",
      }),
    });
  });

  it("posts JSON body for person create", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ id: "p1" }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const api = createApiClient({
      baseUrl: "http://localhost:3000",
      apiKey: "k",
    });

    await api.request({
      method: "POST",
      path: "/person",
      body: { display_name: "Ada", email: "ada@example.com" },
    });

    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.headers).toMatchObject({
      "x-api-key": "k",
      "content-type": "application/json",
    });
    expect(init?.body).toBe(
      JSON.stringify({ display_name: "Ada", email: "ada@example.com" }),
    );
  });

  it("throws ApiError on non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response('{"title":"Not Found"}', { status: 404 })),
    );

    const api = createApiClient({
      baseUrl: "http://localhost:3000",
      apiKey: "k",
    });

    await expect(api.request({ path: "/person/missing" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
