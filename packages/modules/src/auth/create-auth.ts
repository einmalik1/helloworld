import { apiKey } from "@better-auth/api-key";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import type { AppDatabase } from "../database/database.service.js";
import * as authSchema from "../database/auth-schema.js";

export type CreateAuthOptions = {
  db: AppDatabase;
  secret: string;
  baseURL: string;
  webOrigin: string;
};

/** Portable surface used by Nest guard / mount (avoids non-portable Better Auth inference). */
export type AuthInstance = {
  handler: (request: Request) => Promise<Response>;
  api: {
    verifyApiKey: (opts: {
      body: { key: string; configId?: string };
    }) => Promise<{ valid: boolean }>;
    getSession: (opts: {
      headers: Headers;
    }) => Promise<{ session: unknown; user: unknown } | null>;
  };
};

/** Hand-written Better Auth instance (Drizzle adapter + api-key plugin). */
export function createAuth(options: CreateAuthOptions): AuthInstance {
  const auth = betterAuth({
    database: drizzleAdapter(options.db, {
      provider: "pg",
      schema: authSchema,
    }),
    secret: options.secret,
    baseURL: options.baseURL,
    basePath: "/api/auth",
    trustedOrigins: [options.webOrigin],
    emailAndPassword: {
      enabled: true,
    },
    plugins: [
      apiKey({
        apiKeyHeaders: "x-api-key",
      }),
    ],
  });
  return auth as unknown as AuthInstance;
}
