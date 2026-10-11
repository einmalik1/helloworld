import { z } from "zod";

const booleanFromEnv = z
  .union([z.boolean(), z.string()])
  .transform((value) => {
    if (typeof value === "boolean") {
      return value;
    }
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
    return Boolean(normalized);
  });

/** Zod fields apps merge into their `envSchema` when they import ObjectStorageModule. */
export const s3EnvFields = {
  S3_ENDPOINT: z.string().min(1),
  S3_REGION: z.string().min(1).default("us-east-1"),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_BUCKET: z.string().min(1),
  S3_FORCE_PATH_STYLE: booleanFromEnv.default(true),
} as const;

export const s3EnvSchema = z.object(s3EnvFields);

export type S3Env = z.infer<typeof s3EnvSchema>;
