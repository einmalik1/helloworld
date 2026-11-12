import { Inject, Injectable } from "@nestjs/common";
import { DatabaseService, greeting } from "@helloworld/modules";
import type { SearchSyncOutbox } from "@helloworld/platform";
import type { CreateGreeting, UpdateGreeting } from "@helloworld/types/api";
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
export class GreetingService {
  constructor(
    private readonly database: DatabaseService,
    @Inject(SEARCH_SYNC_OUTBOX) private readonly searchOutbox: SearchSyncOutbox,
  ) {}

  async list(page: number, limit: number, channelId?: string) {
    const offset = (page - 1) * limit;
    const where = channelId ? eq(greeting.channel_id, channelId) : undefined;
    try {
      const [totalRow] = await this.database.db
        .select({ total: count() })
        .from(greeting)
        .where(where);
      const items = await this.database.db
        .select()
        .from(greeting)
        .where(where)
        .orderBy(greeting.created_at)
        .limit(limit)
        .offset(offset);
      return { items, total: totalRow?.total ?? 0, page, limit };
    } catch (err) {
      throw new DatabaseError("Failed to list greetings", err);
    }
  }

  async get(id: string) {
    try {
      const [row] = await this.database.db
        .select()
        .from(greeting)
        .where(eq(greeting.id, id))
        .limit(1);
      if (!row) throw new NotFound(`Greeting ${id} not found`);
      return row;
    } catch (err) {
      if (err instanceof NotFound) throw err;
      throw new DatabaseError("Failed to get greeting", err);
    }
  }

  async create(input: CreateGreeting) {
    try {
      const [row] = await this.database.db
        .insert(greeting)
        .values({
          author_id: input.author_id,
          channel_id: input.channel_id,
          message: input.message,
        })
        .returning();
      if (!row) throw new DatabaseError("Failed to create greeting");
      await this.searchOutbox.enqueue({
        aggregateType: "greeting",
        aggregateId: row.id,
        op: "upsert",
        payload: {
          author_id: row.author_id,
          channel_id: row.channel_id,
          message: row.message,
        },
      });
      return row;
    } catch (err) {
      if (isPgCode(err, "23503")) {
        throw new ValidationError("author_id or channel_id does not exist");
      }
      if (err instanceof ValidationError || err instanceof DatabaseError) throw err;
      throw new DatabaseError("Failed to create greeting", err);
    }
  }

  async update(id: string, input: UpdateGreeting) {
    if (Object.keys(input).length === 0) {
      return this.get(id);
    }
    try {
      const [row] = await this.database.db
        .update(greeting)
        .set({
          ...(input.author_id !== undefined ? { author_id: input.author_id } : {}),
          ...(input.channel_id !== undefined ? { channel_id: input.channel_id } : {}),
          ...(input.message !== undefined ? { message: input.message } : {}),
        })
        .where(eq(greeting.id, id))
        .returning();
      if (!row) throw new NotFound(`Greeting ${id} not found`);
      await this.searchOutbox.enqueue({
        aggregateType: "greeting",
        aggregateId: row.id,
        op: "upsert",
        payload: {
          author_id: row.author_id,
          channel_id: row.channel_id,
          message: row.message,
        },
      });
      return row;
    } catch (err) {
      if (err instanceof NotFound) throw err;
      if (isPgCode(err, "23503")) {
        throw new ValidationError("author_id or channel_id does not exist");
      }
      throw new DatabaseError("Failed to update greeting", err);
    }
  }

  async remove(id: string) {
    try {
      const [row] = await this.database.db.delete(greeting).where(eq(greeting.id, id)).returning();
      if (!row) throw new NotFound(`Greeting ${id} not found`);
      await this.searchOutbox.enqueue({
        aggregateType: "greeting",
        aggregateId: row.id,
        op: "delete",
      });
    } catch (err) {
      if (err instanceof NotFound) throw err;
      throw new DatabaseError("Failed to delete greeting", err);
    }
  }
}
