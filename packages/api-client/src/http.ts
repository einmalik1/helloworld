import ky, { type Options } from "ky";

export type ClientOptions = {
  apiUrl: string;
  apiKey?: string;
  /** Browser cookie sessions — pass `"include"`. Default: omit (ky default). */
  credentials?: "include" | "omit" | "same-origin";
};

export const GENERAL_TIMEOUT_MS = 30_000;
export const HEALTH_TIMEOUT_MS = 3_000;

function createKy(opts: ClientOptions, timeout: number) {
  return ky.create({
    prefix: opts.apiUrl.replace(/\/$/, ""),
    timeout,
    credentials: opts.credentials,
    hooks: {
      beforeRequest: [
        ({ request }) => {
          if (opts.apiKey) {
            request.headers.set("x-api-key", opts.apiKey);
          }
        },
      ],
    },
  });
}

let http = ky.create({ timeout: GENERAL_TIMEOUT_MS });

export function configureClient(opts: ClientOptions): void {
  http = createKy(opts, GENERAL_TIMEOUT_MS);
}

/** Orval mutator — (url, options) → Promise<T> */
export const customFetch = async <T>(url: string, options?: Options): Promise<T> => {
  return http(url, options).json<T>();
};

/** Health probe against the configured client — 3s timeout. */
export async function fetchHealth<T = unknown>(path = "health"): Promise<T> {
  return http.get(path, { timeout: HEALTH_TIMEOUT_MS }).json<T>();
}

/**
 * One-off health probe against an arbitrary base URL (does not mutate the global client).
 * Used by CLI/TUI aggregation of api + worker.
 */
export async function fetchHealthFrom<T = unknown>(
  baseUrl: string,
  options?: { apiKey?: string; path?: string },
): Promise<T> {
  const client = createKy({ apiUrl: baseUrl, apiKey: options?.apiKey }, HEALTH_TIMEOUT_MS);
  return client.get(options?.path ?? "health").json<T>();
}
