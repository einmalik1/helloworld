import { defineConfig } from "drizzle-kit";

/**
 * Shared drizzle-kit config (local + Coolify pre-deploy).
 * Apply: `pnpm db:migrate` with `DATABASE_URL` from root `.env`.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./packages/modules/src/database/schema-entry.ts",
  out: "./packages/modules/drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
