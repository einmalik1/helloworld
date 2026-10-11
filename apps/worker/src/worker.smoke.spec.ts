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
    process.env.TYPESENSE_API_KEY ??= "change-me-typesense-local";
    process.env.S3_ENDPOINT ??= "http://127.0.0.1:9000";
    process.env.S3_REGION ??= "us-east-1";
    process.env.S3_ACCESS_KEY_ID ??= "minioadmin";
    process.env.S3_SECRET_ACCESS_KEY ??= "minioadmin";
    process.env.S3_BUCKET ??= "helloworld";
    process.env.S3_FORCE_PATH_STYLE ??= "true";

    const { Test } = await import("@nestjs/testing");
    const {
      AUTH_INSTANCE,
      DatabaseService,
      TypesenseHealthIndicator,
    } = await import("@helloworld/modules");
    const { AppModule } = await import("./app.module.js");
    const { ObjectStorageService } = await import("@helloworld/modules");
    const { OutboxDrainJob } = await import("./jobs/outbox-drain.job.js");
    const { ImpexJob } = await import("./jobs/impex.job.js");
    const { JobsRepository } = await import("./jobs/jobs.repository.js");
    const { ProjectionService } = await import("./projection/projection.service.js");
    const { PROJECTION_SYNC, SEARCH_INDEX, SEARCH_SYNC_OUTBOX } = await import(
      "./projection/projection.tokens.js"
    );
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
        sql: {},
        ping: async () => undefined,
        onModuleDestroy: async () => undefined,
      })
      .overrideProvider(ObjectStorageService)
      .useValue({
        putObject: async () => ({ isErr: () => false, isOk: () => true }),
        getObject: async () => ({ isErr: () => true, error: { message: "mock" } }),
      })
      .overrideProvider(TypesenseHealthIndicator)
      .useValue({
        isHealthy: async (key = "typesense") => ({ [key]: { status: "up" } }),
      })
      .overrideProvider(OutboxDrainJob)
      .useValue({ drain: async () => undefined })
      .overrideProvider(ImpexJob)
      .useValue({ processQueued: async () => undefined })
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
        claimQueuedImpexJobs: async () => [],
      })
      .overrideProvider(SEARCH_INDEX)
      .useValue({})
      .overrideProvider(SEARCH_SYNC_OUTBOX)
      .useValue({})
      .overrideProvider(PROJECTION_SYNC)
      .useValue({
        drainPending: async () => 0,
        rebuild: async () => ({ nodes: 0, documents: 0 }),
      })
      .overrideProvider(ProjectionService)
      .useValue({
        drainOutbox: async () => undefined,
        rebuildIndexes: async () => undefined,
        rebuildNow: async () => ({ nodes: 0, documents: 0 }),
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

  it("composes AppModule with ScheduleModule, ProjectionService, and ImpexJob", async () => {
    expect(app).toBeTruthy();
    const scheduler = app.get(SchedulerRegistry);
    expect(scheduler).toBeTruthy();
    const { ProjectionService } = await import("./projection/projection.service.js");
    const projection = app.get(ProjectionService);
    expect(typeof projection.rebuildNow).toBe("function");
    const { ImpexJob } = await import("./jobs/impex.job.js");
    const impex = app.get(ImpexJob);
    expect(typeof impex.processQueued).toBe("function");
  });

  it("exposes public GET /health", async () => {
    const res = await agent.get("/health").expect(200);
    expect(res.body).toMatchObject({ status: "ok" });
  });

  it("requires auth for GET /jobs", async () => {
    await agent.get("/jobs").expect(401);
  });
});
