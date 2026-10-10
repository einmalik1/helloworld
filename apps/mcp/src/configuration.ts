import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  MCP_HOST: z.string().default("0.0.0.0"),
  MCP_PORT: z.coerce.number().int().min(1).max(65_535).default(3100),
  /** Base URL of apps/api (no trailing slash). */
  API_URL: z.string().url(),
  /** Better Auth managed service key → sent as `x-api-key`. */
  MCP_SERVICE_API_KEY: z.string().min(1),
});

export type McpConfig = z.infer<typeof envSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): McpConfig {
  return envSchema.parse(env);
}
