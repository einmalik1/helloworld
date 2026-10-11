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
    process.env.S3_ENDPOINT ??= "http://127.0.0.1:9000";
    process.env.S3_REGION ??= "us-east-1";
    process.env.S3_ACCESS_KEY_ID ??= "minioadmin";
    process.env.S3_SECRET_ACCESS_KEY ??= "minioadmin";
    process.env.S3_BUCKET ??= "helloworld";
    process.env.S3_FORCE_PATH_STYLE ??= "true";
    process.env.TYPESENSE_HOST ??= "localhost";
    process.env.TYPESENSE_PORT ??= "8108";
    process.env.TYPESENSE_PROTOCOL ??= "http";
    process.env.TYPESENSE_API_KEY ??= "change-me-typesense-local";

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

  it("composes AppModule (config/auth/db/health/logger/graph/search/impex)", () => {
    expect(app).toBeTruthy();
  });

  it("registers graph and search routes (auth required)", async () => {
    await agent.get("/graph/related").expect(401);
    await agent.get("/search").query({ q: "hi" }).expect(401);
  });

  it("requires auth for impex routes", async () => {
    await agent.post("/impex/uploads").send({ content: "[]" }).expect(401);
    await agent.post("/impex/person/exports").send({ format: "json" }).expect(401);
    await agent.post("/impex/person/imports").send({ objectKey: "x", format: "json" }).expect(401);
    await agent.get("/impex/runs").expect(401);
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
