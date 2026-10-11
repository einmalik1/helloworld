import { configureClient, fetchHealthFrom, type ClientOptions } from "@helloworld/api-client";

export function wireApiClient(opts: ClientOptions): void {
  configureClient(opts);
}

export type HealthTargetResult = {
  target: "api" | "worker";
  ok: boolean;
  status?: unknown;
  error?: string;
};

export async function probeHealth(opts: {
  apiUrl: string;
  workerUrl: string;
  apiKey?: string;
}): Promise<HealthTargetResult[]> {
  const run = async (target: "api" | "worker", baseUrl: string): Promise<HealthTargetResult> => {
    try {
      const status = await fetchHealthFrom(baseUrl, { apiKey: opts.apiKey });
      return { target, ok: true, status };
    } catch (err) {
      return {
        target,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  };

  return Promise.all([run("api", opts.apiUrl), run("worker", opts.workerUrl)]);
}
