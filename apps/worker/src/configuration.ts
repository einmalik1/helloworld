import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  DATABASE_URL: z.string().min(1),
  WORKER_CONCURRENCY: z.coerce.number().int().min(1).default(1),
  TYPESENSE_HOST: z.string().default("localhost"),
  TYPESENSE_PORT: z.coerce.number().int().min(1).max(65_535).default(8108),
  TYPESENSE_PROTOCOL: z.enum(["http", "https"]).default("http"),
  TYPESENSE_API_KEY: z.string().min(1).default("change-me-typesense-local"),
  /** Better Auth vars required by shared AuthModule when imported; worker does not serve auth HTTP. */
  BETTER_AUTH_SECRET: z.string().min(1).default("change-me-in-local-dev"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
});

export type WorkerConfig = z.infer<typeof envSchema>;
