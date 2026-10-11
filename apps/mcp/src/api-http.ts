export type ApiHttpConfig = {
  baseUrl: string;
  apiKey: string;
};

export async function apiGetJson<T>(
  config: ApiHttpConfig,
  path: string,
  query: Record<string, string | undefined>,
): Promise<T> {
  const url = new URL(path, config.baseUrl.endsWith("/") ? config.baseUrl : `${config.baseUrl}/`);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  }
  const res = await fetch(url, {
    headers: {
      "x-api-key": config.apiKey,
      accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} ${path}: ${body}`);
  }
  return (await res.json()) as T;
}
