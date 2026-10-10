import "reflect-metadata";

import { Global, Module } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { CreatePersonRow, PersonRow, UpdatePersonRow } from "@helloworld/modules";
import { DatabaseService } from "@helloworld/modules";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ZodValidationPipe } from "nestjs-zod";
import type { SuperAgentTest } from "supertest";
import { randomUUID } from "node:crypto";

import { HttpExceptionFilter } from "../common/filters/http-exception.filter.js";
import { requestIdMiddleware } from "../common/middleware/request-id.middleware.js";
import { PersonModule } from "./person.module.js";

function createMemoryDatabase(): Pick<
  DatabaseService,
  "insertPerson" | "findPersonById" | "listPersons" | "updatePerson" | "deletePerson"
> {
  const rows = new Map<string, PersonRow>();

  return {
    async insertPerson(input: CreatePersonRow): Promise<PersonRow> {
      for (const row of rows.values()) {
        if (row.email === input.email) {
          const error = new Error("duplicate key value violates unique constraint") as Error & {
            code: string;
          };
          error.code = "23505";
          throw error;
        }
      }
      const row: PersonRow = {
        id: randomUUID(),
        display_name: input.display_name,
        email: input.email,
        created_at: new Date(),
      };
      rows.set(row.id, row);
      return row;
    },
    async findPersonById(id: string): Promise<PersonRow | null> {
      return rows.get(id) ?? null;
    },
    async listPersons(page: number, limit: number) {
      const items = [...rows.values()].sort(
        (a, b) => b.created_at.getTime() - a.created_at.getTime(),
      );
      const offset = (page - 1) * limit;
      return { items: items.slice(offset, offset + limit), total: items.length };
    },
    async updatePerson(id: string, input: UpdatePersonRow): Promise<PersonRow | null> {
      const existing = rows.get(id);
      if (!existing) {
        return null;
      }
      if (input.email !== undefined) {
        for (const row of rows.values()) {
          if (row.id !== id && row.email === input.email) {
            const error = new Error("duplicate key") as Error & { code: string };
            error.code = "23505";
            throw error;
          }
        }
      }
      const next: PersonRow = {
        ...existing,
        ...(input.display_name !== undefined ? { display_name: input.display_name } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
      };
      rows.set(id, next);
      return next;
    },
    async deletePerson(id: string): Promise<boolean> {
      return rows.delete(id);
    },
  };
}

describe("Person CRUD smoke", () => {
  let app: INestApplication;
  let agent: SuperAgentTest;

  beforeAll(async () => {
    @Global()
    @Module({
      providers: [{ provide: DatabaseService, useValue: createMemoryDatabase() }],
      exports: [DatabaseService],
    })
    class MemoryDatabaseModule {}

    @Module({
      imports: [MemoryDatabaseModule, PersonModule],
    })
    class PersonSmokeRootModule {}

    const moduleRef = await Test.createTestingModule({
      imports: [PersonSmokeRootModule],
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

  it("creates then gets person by id", async () => {
    const email = `smoke-${randomUUID()}@example.com`;
    const created = await agent
      .post("/person")
      .set("x-request-id", "person-create-1")
      .send({ display_name: "Ada Lovelace", email })
      .expect(201);

    expect(created.body).toMatchObject({
      display_name: "Ada Lovelace",
      email,
    });
    expect(created.body.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const got = await agent.get(`/person/${created.body.id}`).expect(200);
    expect(got.body).toMatchObject({
      id: created.body.id,
      display_name: "Ada Lovelace",
      email,
    });
  });

  it("rejects duplicate email with 400 Problem Details", async () => {
    const email = `dup-${randomUUID()}@example.com`;
    await agent.post("/person").send({ display_name: "First", email }).expect(201);

    const res = await agent
      .post("/person")
      .set("x-request-id", "person-dup-1")
      .send({ display_name: "Second", email })
      .expect(400);

    expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
    expect(res.body).toMatchObject({
      type: "urn:helloworld:problem:validation",
      status: 400,
      detail: "email already exists",
      requestId: "person-dup-1",
    });
  });

  it("returns 404 Problem Details for missing id", async () => {
    const missingId = randomUUID();
    const res = await agent
      .get(`/person/${missingId}`)
      .set("x-request-id", "person-miss-1")
      .expect(404);

    expect(res.headers["content-type"]).toMatch(/application\/problem\+json/);
    expect(res.body).toMatchObject({
      type: "urn:helloworld:problem:not-found",
      status: 404,
      requestId: "person-miss-1",
    });
  });
});
