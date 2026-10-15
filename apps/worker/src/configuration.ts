import { s3EnvFields } from "@helloworld/modules";
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().min(1),
  WORKER_HOST: z.string().default("0.0.0.0"),
  WORKER_PORT: z.coerce.number().int().min(1).max(65_535).default(3001),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).max(100).default(1),
  // Empty host/key → Typesense health indicator skips (Coolify until search is provisioned).
  TYPESENSE_HOST: z.string().default(""),
  TYPESENSE_PORT: z.coerce.number().int().min(1).max(65_535).default(8108),
  TYPESENSE_PROTOCOL: z.enum(["http", "https"]).default("http"),
  TYPESENSE_API_KEY: z.string().default(""),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),
  ...s3EnvFields,
});

export type AppConfig = z.infer<typeof envSchema>;
/** Alias used by projection providers from search ticket. */
export type WorkerConfig = AppConfig;
