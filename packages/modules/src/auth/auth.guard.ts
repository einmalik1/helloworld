import {
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

import type { AuthInstance } from "./create-auth.js";
import { AUTH_INSTANCE } from "./auth.tokens.js";
import { IS_PUBLIC_KEY } from "./public.decorator.js";

const API_KEY_HEADER = "x-api-key";

function requestPath(req: Request): string {
  const url = req.originalUrl ?? req.url ?? "";
  return url.split("?")[0] ?? "";
}

function isInfrastructurePublicPath(path: string): boolean {
  return (
    path === "/health" ||
    path.startsWith("/api/auth") ||
    path.startsWith("/api/docs") ||
    path === "/openapi.json"
  );
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_INSTANCE) private readonly auth: AuthInstance,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    if (isInfrastructurePublicPath(requestPath(req))) {
      return true;
    }

    const apiKeyHeader = req.headers[API_KEY_HEADER];
    const apiKey =
      typeof apiKeyHeader === "string"
        ? apiKeyHeader
        : Array.isArray(apiKeyHeader)
          ? apiKeyHeader[0]
          : undefined;

    if (apiKey) {
      const verified = await this.auth.api.verifyApiKey({
        body: { key: apiKey },
      });
      if (verified.valid) {
        return true;
      }
      throw new UnauthorizedException("Invalid API key");
    }

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (session) {
      return true;
    }

    throw new UnauthorizedException("Authentication required");
  }
}
