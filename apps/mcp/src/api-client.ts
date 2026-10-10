const API_KEY_HEADER = "x-api-key";

export type ApiClientOptions = {
  baseUrl: string;
  apiKey: string;
  fetchImpl?: typeof fetch;
};

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
};

export class ApiError extends Error {
  readonly status: number;
  readonly bodyText: string;

  constructor(status: number, bodyText: string) {
    super(`API ${status}: ${bodyText}`);
    this.name = "ApiError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

/** Thin fetch client for apps/api — not `@helloworld/api-client`. */
export function createApiClient(options: ApiClientOptions) {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const fetchImpl = options.fetchImpl ?? fetch;

  async function request<T = unknown>(req: ApiRequestOptions): Promise<T> {
    const url = new URL(req.path.startsWith("/") ? req.path : `/${req.path}`, `${baseUrl}/`);
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      [API_KEY_HEADER]: options.apiKey,
      accept: "application/json",
    };
    let body: string | undefined;
    if (req.body !== undefined) {
      headers["content-type"] = "application/json";
      body = JSON.stringify(req.body);
    }

    const response = await fetchImpl(url, {
      method: req.method ?? "GET",
      headers,
      body,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    if (!response.ok) {
      throw new ApiError(response.status, text.slice(0, 2000));
    }

    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  return {
    request,
    /** Exposed for smoke tests. */
    buildUrl(path: string, query?: ApiRequestOptions["query"]): string {
      const url = new URL(path.startsWith("/") ? path : `/${path}`, `${baseUrl}/`);
      if (query) {
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined) {
            url.searchParams.set(key, String(value));
          }
        }
      }
      return url.toString();
    },
    apiKeyHeader: API_KEY_HEADER,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
