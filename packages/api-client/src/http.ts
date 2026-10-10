import ky, { type Options } from "ky";

export type ClientOptions = {
  apiUrl: string;
  apiKey?: string;
};

export const GENERAL_TIMEOUT_MS = 30_000;
export const HEALTH_TIMEOUT_MS = 3_000;

let http = ky.create({ timeout: GENERAL_TIMEOUT_MS });

export function configureClient(opts: ClientOptions): void {
  http = ky.create({
    prefix: opts.apiUrl.replace(/\/$/, ""),
    timeout: GENERAL_TIMEOUT_MS,
    hooks: {
      beforeRequest: [
        ({ request }) => {
          if (opts.apiKey) request.headers.set("x-api-key", opts.apiKey);
        },
      ],
    },
  });
}

/** Orval mutator — (url, options) → Promise<T> */
export const customFetch = async <T>(
  url: string,
  options?: Options,
): Promise<T> => {
  return http(url, options).json<T>();
};

/** Health probe — 3s timeout; used by CLI/TUI aggregation */
export async function fetchHealth<T = unknown>(path = "health"): Promise<T> {
  return http.get(path, { timeout: HEALTH_TIMEOUT_MS }).json<T>();
}
