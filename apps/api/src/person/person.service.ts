import { Inject, Injectable } from "@nestjs/common";
import { DatabaseService, person } from "@helloworld/modules";
import type { SearchSyncOutbox } from "@helloworld/platform";
import type { CreatePerson, UpdatePerson } from "@helloworld/types/api";
import { DatabaseError, NotFound, ValidationError } from "@helloworld/types";
import { count, eq } from "drizzle-orm";

import { SEARCH_SYNC_OUTBOX } from "../search-graph/search-graph.tokens.js";

function isPgCode(err: unknown, code: string): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === code
  );
}

@Injectable()
export class PersonService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(SEARCH_SYNC_OUTBOX) private readonly searchOutbox: SearchSyncOutbox,
  ) {}

  async list(page: number, limit: number) {
    const offset = (page - 1) * limit;
    try {
      const [totalRow] = await this.database.db.select({ total: count() }).from(person);
      const items = await this.database.db
        .select()
        .from(person)
        .orderBy(person.created_at)
        .limit(limit)
        .offset(offset);
      return { items, total: totalRow?.total ?? 0, page, limit };
    } catch (err) {
      throw new DatabaseError("Failed to list persons", err);
    }
  }

  async get(id: string) {
    try {
      const [row] = await this.database.db.select().from(person).where(eq(person.id, id)).limit(1);
      if (!row) throw new NotFound(`Person ${id} not found`);
      return row;
    } catch (err) {
      if (err instanceof NotFound) throw err;
      throw new DatabaseError("Failed to get person", err);
    }
  }

  async create(input: CreatePerson) {
    try {
      const [row] = await this.database.db
        .insert(person)
        .values({
          display_name: input.display_name,
          email: input.email,
        })
        .returning();
      if (!row) throw new DatabaseError("Failed to create person");
      await this.searchOutbox.enqueue({
        aggregateType: "person",
        aggregateId: row.id,
        op: "upsert",
        payload: {
          display_name: row.display_name,
          email: row.email,
        },
      });
      return row;
    } catch (err) {
      if (isPgCode(err, "23505")) {
        throw new ValidationError("Person email already exists");
      }
      if (err instanceof ValidationError || err instanceof DatabaseError) throw err;
      throw new DatabaseError("Failed to create person", err);
    }
  }

  async update(id: string, input: UpdatePerson) {
    if (Object.keys(input).length === 0) {
      return this.get(id);
    }
    try {
      const [row] = await this.database.db
        .update(person)
        .set({
          ...(input.display_name !== undefined ? { display_name: input.display_name } : {}),
          ...(input.email !== undefined ? { email: input.email } : {}),
        })
        .where(eq(person.id, id))
        .returning();
      if (!row) throw new NotFound(`Person ${id} not found`);
      await this.searchOutbox.enqueue({
        aggregateType: "person",
        aggregateId: row.id,
        op: "upsert",
        payload: {
          display_name: row.display_name,
          email: row.email,
        },
      });
      return row;
    } catch (err) {
      if (err instanceof NotFound) throw err;
      if (isPgCode(err, "23505")) {
        throw new ValidationError("Person email already exists");
      }
      throw new DatabaseError("Failed to update person", err);
    }
  }

  async remove(id: string) {
    try {
      const [row] = await this.database.db.delete(person).where(eq(person.id, id)).returning();
      if (!row) throw new NotFound(`Person ${id} not found`);
      await this.searchOutbox.enqueue({
        aggregateType: "person",
        aggregateId: row.id,
        op: "delete",
      });
    } catch (err) {
      if (err instanceof NotFound) throw err;
      throw new DatabaseError("Failed to delete person", err);
    }
  }
}
