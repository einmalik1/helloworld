import "reflect-metadata";

import { Global, Module } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type {
  CreateGreetingReactionRow,
  GreetingReactionRow,
  UpdateGreetingReactionRow,
} from "@helloworld/modules";
import { DatabaseService } from "@helloworld/modules";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ZodValidationPipe } from "nestjs-zod";
import type { SuperAgentTest } from "supertest";
import { randomUUID } from "node:crypto";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter.js";
import { requestIdMiddleware } from "../common/middleware/request-id.middleware.js";
import { GreetingReactionModule } from "./greeting-reaction.module.js";

type MemoryGreetingReactionDb = Pick<
  DatabaseService,
  | "insertGreetingReaction"
  | "findGreetingReactionById"
  | "listGreetingReactions"
  | "updateGreetingReaction"
  | "deleteGreetingReaction"
> & {
  seedGreeting(id: string): void;
  seedPerson(id: string): void;
  cascadeDeleteGreeting(greetingId: string): void;
};

function createMemoryDatabase(): MemoryGreetingReactionDb {
  const rows = new Map<string, GreetingReactionRow>();
  const greetings = new Set<string>();
  const people = new Set<string>();

  const uniqueKey = (greetingId: string, personId: string, emoji: string) =>
    `${greetingId}|${personId}|${emoji}`;

  return {
    seedGreeting(id: string) {
      greetings.add(id);
    },
    seedPerson(id: string) {
      people.add(id);
    },
    cascadeDeleteGreeting(greetingId: string) {
      for (const [id, row] of rows) {
        if (row.greeting_id === greetingId) {
          rows.delete(id);
        }
      }
      greetings.delete(greetingId);
    },
    async insertGreetingReaction(
      input: CreateGreetingReactionRow,
    ): Promise<GreetingReactionRow> {
      if (!greetings.has(input.greeting_id) || !people.has(input.person_id)) {
        const error = new Error("foreign key violation") as Error & { code: string };
        error.code = "23503";
        throw error;
      }
      for (const row of rows.values()) {
        if (
          uniqueKey(row.greeting_id, row.person_id, row.emoji) ===
          uniqueKey(input.greeting_id, input.person_id, input.emoji)
        ) {
          const error = new Error("duplicate key") as Error & { code: string };
          error.code = "23505";
          throw error;
        }
      }
      const row: GreetingReactionRow = {
        id: randomUUID(),
        greeting_id: input.greeting_id,
        person_id: input.person_id,
        emoji: input.emoji,
        created_at: new Date(),
      };
      rows.set(row.id, row);
      return row;
    },
    async findGreetingReactionById(id: string): Promise<GreetingReactionRow | null> {
      return rows.get(id) ?? null;
    },
    async listGreetingReactions(page: number, limit: number) {
      const items = [...rows.values()].sort(
        (a, b) => b.created_at.getTime() - a.created_at.getTime(),
      );
      const offset = (page - 1) * limit;
      return { items: items.slice(offset, offset + limit), total: items.length };
    },
    async updateGreetingReaction(
      id: string,
      input: UpdateGreetingReactionRow,
    ): Promise<GreetingReactionRow | null> {
      const existing = rows.get(id);
      if (!existing) {
        return null;
      }
      const next: GreetingReactionRow = {
        ...existing,
        ...(input.greeting_id !== undefined ? { greeting_id: input.greeting_id } : {}),
        ...(input.person_id !== undefined ? { person_id: input.person_id } : {}),
        ...(input.emoji !== undefined ? { emoji: input.emoji } : {}),
      };
      if (!greetings.has(next.greeting_id) || !people.has(next.person_id)) {
        const error = new Error("foreign key violation") as Error & { code: string };
        error.code = "23503";
        throw error;
      }
      for (const row of rows.values()) {
        if (
          row.id !== id &&
          uniqueKey(row.greeting_id, row.person_id, row.emoji) ===
            uniqueKey(next.greeting_id, next.person_id, next.emoji)
        ) {
          const error = new Error("duplicate key") as Error & { code: string };
          error.code = "23505";
          throw error;
        }
      }
      rows.set(id, next);
      return next;
    },
    async deleteGreetingReaction(id: string): Promise<boolean> {
      return rows.delete(id);
    },
  };
}

describe("GreetingReaction CRUD smoke", () => {
  let app: INestApplication;
  let agent: SuperAgentTest;
  let memoryDb: MemoryGreetingReactionDb;

  beforeAll(async () => {
    memoryDb = createMemoryDatabase();

    @Global()
    @Module({
      providers: [{ provide: DatabaseService, useValue: memoryDb }],
      exports: [DatabaseService],
    })
    class MemoryDatabaseModule {}

    @Module({
      imports: [MemoryDatabaseModule, GreetingReactionModule],
    })
    class GreetingReactionSmokeRootModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [GreetingReactionSmokeRootModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(requestIdMiddleware);
    app.useGlobalPipes(new ZodValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    const request = (await import("supertest")).default;
    agent = request(app.getHttpServer()) as unknown as SuperAgentTest;
  });

  afterAll(async () => {
    await app?.close();
  });

  it("creates then gets greeting reaction by id", async () => {
    const greetingId = randomUUID();
    const personId = randomUUID();
    memoryDb.seedGreeting(greetingId);
    memoryDb.seedPerson(personId);

    const created = await agent
      .post("/greeting-reaction")
      .set("x-request-id", "reaction-create-1")
      .send({ greeting_id: greetingId, person_id: personId, emoji: "👍" })
      .expect(201);

    expect(created.body).toMatchObject({
      greeting_id: greetingId,
      person_id: personId,
      emoji: "👍",
    });
    expect(created.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const got = await agent.get(`/greeting-reaction/${created.body.id}`).expect(200);
    expect(got.body).toMatchObject({
      id: created.body.id,
      greeting_id: greetingId,
      person_id: personId,
      emoji: "👍",
    });
  });

  it("rejects duplicate reaction with 400 Problem Details", async () => {
    const greetingId = randomUUID();
    const personId = randomUUID();
    memoryDb.seedGreeting(greetingId);
    memoryDb.seedPerson(personId);

    await agent
      .post("/greeting-reaction")
      .send({ greeting_id: greetingId, person_id: personId, emoji: "🎉" })
      .expect(201);

    const res = await agent
      .post("/greeting-reaction")
      .set("x-request-id", "reaction-dup-1")
      .send({ greeting_id: greetingId, person_id: personId, emoji: "🎉" })
      .expect(400);

    expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
    expect(res.body).toMatchObject({
      type: "urn:helloworld:problem:validation",
      status: 400,
      detail: "reaction already exists",
      requestId: "reaction-dup-1",
    });
  });

  it("returns 404 Problem Details for missing id", async () => {
    const missingId = randomUUID();
    const res = await agent
      .get(`/greeting-reaction/${missingId}`)
      .set("x-request-id", "reaction-miss-1")
      .expect(404);

    expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
    expect(res.body).toMatchObject({
      type: "urn:helloworld:problem:not-found",
      status: 404,
      requestId: "reaction-miss-1",
    });
  });

  it("cascades away reactions when greeting is deleted", async () => {
    const greetingId = randomUUID();
    const personId = randomUUID();
    memoryDb.seedGreeting(greetingId);
    memoryDb.seedPerson(personId);

    const created = await agent
      .post("/greeting-reaction")
      .send({ greeting_id: greetingId, person_id: personId, emoji: "🔥" })
      .expect(201);

    memoryDb.cascadeDeleteGreeting(greetingId);

    const list = await agent.get("/greeting-reaction").expect(200);
    expect(list.body.items.some((item: { id: string }) => item.id === created.body.id)).toBe(
      false,
    );
  });
});
