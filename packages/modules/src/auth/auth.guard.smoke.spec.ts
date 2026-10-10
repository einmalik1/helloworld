import "reflect-metadata";

import {
  Controller,
  Get,
  type INestApplication,
  Module,
} from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { SuperAgentTest } from "supertest";

import { AuthGuard } from "./auth.guard.js";
import { AUTH_INSTANCE } from "./auth.tokens.js";
import type { AuthInstance } from "./create-auth.js";
import { Public } from "./public.decorator.js";

describe("AuthGuard smoke", () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let guard: AuthGuard;

  const authMock: AuthInstance = {
    handler: async () => new Response(null, { status: 404 }),
    api: {
      verifyApiKey: vi.fn(async () => ({ valid: false })),
      getSession: vi.fn(async () => null),
    },
  };

  @Controller("auth-smoke")
  class ProtectedController {
    @Get("secret")
    secret(): { ok: true } {
      return { ok: true };
    }
  }

  @Controller("auth-smoke")
  class PublicController {
    @Public()
    @Get("open")
    open(): { ok: true } {
      return { ok: true };
    }
  }

  beforeAll(async () => {
    @Module({
      controllers: [ProtectedController, PublicController],
      providers: [
        Reflector,
        { provide: AUTH_INSTANCE, useValue: authMock },
        AuthGuard,
        { provide: APP_GUARD, useExisting: AuthGuard },
      ],
    })
    class SmokeModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [SmokeModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    guard = moduleRef.get(AuthGuard);
    const request = (await import("supertest")).default;
    agent = request(app.getHttpServer()) as unknown as SuperAgentTest;
  });

  afterAll(async () => {
    await app?.close();
  });

  it("returns 401 on protected route without credentials", async () => {
    await agent.get("/auth-smoke/secret").expect(401);
  });

  it("allows @Public routes without credentials", async () => {
    const res = await agent.get("/auth-smoke/open").expect(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("treats /api/auth paths as infrastructure-public", async () => {
    const ok = await guard.canActivate({
      getHandler: () => ProtectedController.prototype.secret,
      getClass: () => ProtectedController,
      switchToHttp: () => ({
        getRequest: () => ({
          originalUrl: "/api/auth/sign-in/email",
          url: "/api/auth/sign-in/email",
          headers: {},
        }),
      }),
    } as never);
    expect(ok).toBe(true);
  });

  it("accepts valid x-api-key via verifyApiKey", async () => {
    vi.mocked(authMock.api.verifyApiKey).mockResolvedValueOnce({ valid: true });
    const res = await agent
      .get("/auth-smoke/secret")
      .set("x-api-key", "smoke-key")
      .expect(200);
    expect(res.body).toEqual({ ok: true });
    expect(authMock.api.verifyApiKey).toHaveBeenCalledWith({
      body: { key: "smoke-key" },
    });
  });
});
