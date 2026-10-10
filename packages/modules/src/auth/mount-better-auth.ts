import type { INestApplication } from "@nestjs/common";
import { toNodeHandler } from "better-auth/node";
import type { RequestHandler } from "express";

import type { AuthInstance } from "./create-auth.js";

/**
 * Mount Better Auth HTTP handlers on the Nest Express adapter.
 * Better Auth remains SoT for auth routes under `/api/auth`.
 */
export function mountBetterAuth(
  app: INestApplication,
  auth: AuthInstance,
  basePath = "/api/auth",
): void {
  const handler = toNodeHandler(auth as never) as RequestHandler;
  const expressApp = app.getHttpAdapter().getInstance() as {
    use: (path: string, ...handlers: RequestHandler[]) => void;
  };
  expressApp.use(basePath, handler);
}
