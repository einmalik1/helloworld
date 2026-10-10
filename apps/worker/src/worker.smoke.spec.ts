import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SuperAgentTest } from "supertest";

describe("Worker Nest smoke", () => {
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
    process.env.WORKER_PORT ??= "3001";
    process.env.WORKER_HOST ??= "127.0.0.1";
    process.env.WORKER_CONCURRENCY ??= "1";

    const { Test } = await import("@nestjs/testing");
    const { AUTH_INSTANCE, DatabaseService } = await import("@helloworld/modules");
    const { AppModule } = await import("./app.module.js");
    const { OutboxDrainJob } = await import("./jobs/outbox-drain.job.js");
    const { JobsRepository } = await import("./jobs/jobs.repository.js");
    const { requestIdMiddleware } = await import("./common/middleware/request-id.middleware.js");
    const { HttpExceptionFilter } = await import("./common/filters/http-exception.filter.js");
    const request = (await import("supertest")).default;

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AUTH_INSTANCE)
      .useValue({
        handler: async () => new Response(null, { status: 404 }),
        api: {
          verifyApiKey: async () => ({ valid: false }),
          getSession: async () => null,
        },
      })
      .overrideProvider(DatabaseService)
      .useValue({
        db: {},
        ping: async () => undefined,
        onModuleDestroy: async () => undefined,
      })
      .overrideProvider(OutboxDrainJob)
      .useValue({ drain: async () => undefined })
      .overrideProvider(JobsRepository)
      .useValue({
        listJobs: async () => [],
        getJob: async () => {
          throw new Error("not used");
        },
        retryJob: async () => {
          throw new Error("not used");
        },
        claimPendingOutbox: async () => [],
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.use(requestIdMiddleware);
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    agent = request(app.getHttpServer()) as unknown as SuperAgentTest;
  });

  afterAll(async () => {
    await app?.close();
  });

  it("composes AppModule with ScheduleModule", () => {
    expect(app).toBeTruthy();
    const scheduler = app.get(SchedulerRegistry);
    expect(scheduler).toBeTruthy();
  });

  it("exposes public GET /health", async () => {
    const res = await agent.get("/health").expect(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("requires auth for GET /jobs", async () => {
    await agent.get("/jobs").expect(401);
  });
});
