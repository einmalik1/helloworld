import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SuperAgentTest } from "supertest";

describe("API HTTP contract smoke", () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const { chdirRepoRoot } = await import("./chdir-repo-root.js");
    chdirRepoRoot();
    process.env.DATABASE_URL ??= "postgresql://helloworld:helloworld@127.0.0.1:5432/helloworld";
    process.env.BETTER_AUTH_SECRET ??= "smoke-secret-change-me";
    process.env.BETTER_AUTH_URL ??= "http://localhost:3000";
    process.env.WEB_ORIGIN ??= "http://localhost:5173";
    process.env.LOG_LEVEL ??= "info";
    process.env.NODE_ENV ??= "test";
    process.env.API_PORT ??= "3000";
    process.env.API_HOST ??= "127.0.0.1";

    const { Controller, Get, Module } = await import("@nestjs/common");
    const { Test } = await import("@nestjs/testing");
    const { Public } = await import("@helloworld/modules");
    const { NotFound } = await import("@helloworld/types");
    const { AppModule } = await import("./app.module.js");
    const { HttpExceptionFilter } = await import("./common/filters/http-exception.filter.js");
    const { requestIdMiddleware } = await import("./common/middleware/request-id.middleware.js");
    const request = (await import("supertest")).default;

    @Controller("smoke-probe")
    @Public()
    class SmokeProbeController {
      @Get("missing")
      missing(): never {
        throw new NotFound("probe missing");
      }
    }

    @Module({
      controllers: [SmokeProbeController],
    })
    class SmokeProbeModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, SmokeProbeModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(requestIdMiddleware);
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    agent = request(app.getHttpServer()) as unknown as SuperAgentTest;
  });

  afterAll(async () => {
    await app?.close();
  });

  it("composes AppModule (config/auth/db/health/logger)", () => {
    expect(app).toBeTruthy();
  });

  it("maps NotFound to Problem Details with requestId", async () => {
    const res = await agent
      .get("/smoke-probe/missing")
      .set("x-request-id", "smoke-req-1")
      .expect(404);

    expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
    expect(res.headers["x-request-id"]).toBe("smoke-req-1");
    expect(res.body).toMatchObject({
      type: "urn:helloworld:problem:not-found",
      title: "Not Found",
      status: 404,
      detail: "probe missing",
      requestId: "smoke-req-1",
    });
  });
});
