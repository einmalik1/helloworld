import "reflect-metadata";

import type { INestApplication } from "@nestjs/common";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { SuperAgentTest } from "supertest";

describe("Channel API smoke", () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    const { Injectable, Module } = await import("@nestjs/common");
    const { Test } = await import("@nestjs/testing");
    const {
      createChannel,
      deleteChannel,
      getChannel,
      listChannels,
      updateChannel,
      UniqueSlugError,
    } = await import("@helloworld/platform");
    type ChannelRecord = import("@helloworld/platform").ChannelRecord;
    type ChannelRepository = import("@helloworld/platform").ChannelRepository;
    const { ChannelController } = await import("./channel.controller.js");
    const { ChannelService } = await import("./channel.service.js");
    const { HttpExceptionFilter } = await import(
      "../common/filters/http-exception.filter.js"
    );
    const { requestIdMiddleware } = await import(
      "../common/middleware/request-id.middleware.js"
    );
    const { ZodValidationPipe } = await import("nestjs-zod");
    const request = (await import("supertest")).default;

    function createMemoryRepo(): ChannelRepository {
      const rows = new Map<string, ChannelRecord>();
      return {
        async insert(input) {
          for (const row of rows.values()) {
            if (row.slug === input.slug) {
              throw new UniqueSlugError();
            }
          }
          const record: ChannelRecord = {
            id: crypto.randomUUID(),
            slug: input.slug,
            name: input.name,
            created_at: new Date(),
          };
          rows.set(record.id, record);
          return record;
        },
        async findById(id) {
          return rows.get(id) ?? null;
        },
        async list({ page, limit }) {
          const all = [...rows.values()].sort(
            (a, b) => a.created_at.getTime() - b.created_at.getTime(),
          );
          const start = (page - 1) * limit;
          return { items: all.slice(start, start + limit), total: all.length };
        },
        async update(id, input) {
          const existing = rows.get(id);
          if (!existing) {
            return null;
          }
          if (input.slug !== undefined) {
            for (const row of rows.values()) {
              if (row.id !== id && row.slug === input.slug) {
                throw new UniqueSlugError();
              }
            }
          }
          const next: ChannelRecord = {
            ...existing,
            slug: input.slug ?? existing.slug,
            name: input.name ?? existing.name,
          };
          rows.set(id, next);
          return next;
        },
        async delete(id) {
          return rows.delete(id);
        },
      };
    }

    @Injectable()
    class MemoryChannelService {
      private readonly repo = createMemoryRepo();

      create(input: { slug: string; name: string }) {
        return createChannel(this.repo, input);
      }

      findOne(id: string) {
        return getChannel(this.repo, id);
      }

      findAll(page: number, limit: number) {
        return listChannels(this.repo, { page, limit });
      }

      update(id: string, input: { slug?: string; name?: string }) {
        return updateChannel(this.repo, id, input);
      }

      remove(id: string) {
        return deleteChannel(this.repo, id);
      }
    }

    @Module({
      controllers: [ChannelController],
      providers: [{ provide: ChannelService, useClass: MemoryChannelService }],
    })
    class ChannelSmokeModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [ChannelSmokeModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(requestIdMiddleware);
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    agent = request(app.getHttpServer()) as unknown as SuperAgentTest;
  });

  afterAll(async () => {
    await app?.close();
  });

  it("creates a channel then lists it", async () => {
    const created = await agent
      .post("/channel")
      .set("x-request-id", "channel-smoke-1")
      .send({ slug: "web", name: "Web" })
      .expect(201);

    expect(created.body).toMatchObject({
      slug: "web",
      name: "Web",
    });
    expect(created.body.id).toBeTruthy();

    const listed = await agent.get("/channel").expect(200);
    expect(listed.body).toMatchObject({
      total: 1,
      page: 1,
      limit: 20,
    });
    expect(listed.body.items).toHaveLength(1);
    expect(listed.body.items[0].id).toBe(created.body.id);
  });

  it("rejects duplicate slug with Problem Details 400", async () => {
    await agent
      .post("/channel")
      .send({ slug: "cli", name: "CLI" })
      .expect(201);

    const res = await agent
      .post("/channel")
      .set("x-request-id", "channel-smoke-dup")
      .send({ slug: "cli", name: "CLI 2" })
      .expect(400);

    expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
    expect(res.body).toMatchObject({
      type: "urn:helloworld:problem:validation",
      title: "Bad Request",
      status: 400,
      requestId: "channel-smoke-dup",
    });
  });
});
