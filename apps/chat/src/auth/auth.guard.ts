import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "./public.decorator.js";

export type ChatAuth = {
  personId: string;
  via: "api-key" | "session";
};

export type AuthedRequest = Request & { chatAuth?: ChatAuth };

/**
 * Stub aligned with Better Auth intent:
 * - `x-api-key` must match `CHAT_DEV_API_KEY` (local / machine clients)
 * - or a non-empty Better Auth session cookie (web)
 * Full Better Auth verifyApiKey / session lookup lands with packages/modules auth.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const expectedKey = process.env.CHAT_DEV_API_KEY ?? "change-me-chat-local";
    const apiKey = req.header("x-api-key");
    if (apiKey && apiKey === expectedKey) {
      req.chatAuth = {
        personId: req.header("x-person-id") ?? "00000000-0000-4000-8000-000000000001",
        via: "api-key",
      };
      return true;
    }

    const cookie = req.headers.cookie ?? "";
    if (/better-auth\.session_token=([^;]+)/.test(cookie)) {
      req.chatAuth = {
        personId: req.header("x-person-id") ?? "00000000-0000-4000-8000-000000000001",
        via: "session",
      };
      return true;
    }

    throw new UnauthorizedException({
      type: "about:blank",
      title: "Unauthorized",
      status: 401,
      detail: "Missing session cookie or valid x-api-key",
    });
  }
}
