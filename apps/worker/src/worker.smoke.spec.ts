import "reflect-metadata";

import { Test } from "@nestjs/testing";
import { afterAll, describe, expect, it } from "vitest";
import { SchedulerRegistry } from "@nestjs/schedule";

describe("worker smoke", () => {
  afterAll(() => {
    // leave env for other tests
  });

  it("boots ScheduleModule + ProjectionService providers", async () => {
    process.env.DATABASE_URL ??= "postgresql://helloworld:helloworld@127.0.0.1:5432/helloworld";
    process.env.LOG_LEVEL ??= "info";
    process.env.NODE_ENV ??= "test";
    process.env.TYPESENSE_API_KEY ??= "change-me-typesense-local";

    const { chdirRepoRoot } = await import("./chdir-repo-root.js");
    chdirRepoRoot();

    const { AppModule } = await import("./app.module.js");
    const { ProjectionService } = await import("./projection/projection.service.js");

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const projection = moduleRef.get(ProjectionService);
    expect(projection).toBeTruthy();
    expect(typeof projection.rebuildNow).toBe("function");

    const registry = moduleRef.get(SchedulerRegistry);
    expect(registry).toBeTruthy();

    await moduleRef.close();
  });
});
