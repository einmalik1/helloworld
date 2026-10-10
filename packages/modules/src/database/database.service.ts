import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { count, desc, eq } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema-entry.js";
import { greeting_reaction } from "./schema/greeting_reaction.js";

export type AppDatabase = PostgresJsDatabase<typeof schema>;

export type GreetingReactionRow = {
  id: string;
  greeting_id: string;
  person_id: string;
  emoji: string;
  created_at: Date;
};

export type CreateGreetingReactionRow = {
  greeting_id: string;
  person_id: string;
  emoji: string;
};

export type UpdateGreetingReactionRow = {
  greeting_id?: string;
  person_id?: string;
  emoji?: string;
};

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client: Sql;
  readonly db: AppDatabase;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>("DATABASE_URL");
    this.client = postgres(url);
    this.db = drizzle(this.client, { schema });
  }

  /** Postgres reachability probe for Terminus / ops. */
  async ping(): Promise<void> {
    await this.client`select 1`;
  }

  async insertGreetingReaction(input: CreateGreetingReactionRow): Promise<GreetingReactionRow> {
    const [row] = await this.db
      .insert(greeting_reaction)
      .values({
        greeting_id: input.greeting_id,
        person_id: input.person_id,
        emoji: input.emoji,
      })
      .returning();
    if (!row) {
      throw new Error("insertGreetingReaction returned no row");
    }
    return row;
  }

  async findGreetingReactionById(id: string): Promise<GreetingReactionRow | null> {
    const [row] = await this.db
      .select()
      .from(greeting_reaction)
      .where(eq(greeting_reaction.id, id))
      .limit(1);
    return row ?? null;
  }

  async listGreetingReactions(
    page: number,
    limit: number,
  ): Promise<{ items: GreetingReactionRow[]; total: number }> {
    const offset = (page - 1) * limit;
    const [totalRow] = await this.db.select({ value: count() }).from(greeting_reaction);
    const items = await this.db
      .select()
      .from(greeting_reaction)
      .orderBy(desc(greeting_reaction.created_at))
      .limit(limit)
      .offset(offset);
    return { items, total: Number(totalRow?.value ?? 0) };
  }

  async updateGreetingReaction(
    id: string,
    input: UpdateGreetingReactionRow,
  ): Promise<GreetingReactionRow | null> {
    const patch: Partial<CreateGreetingReactionRow> = {};
    if (input.greeting_id !== undefined) {
      patch.greeting_id = input.greeting_id;
    }
    if (input.person_id !== undefined) {
      patch.person_id = input.person_id;
    }
    if (input.emoji !== undefined) {
      patch.emoji = input.emoji;
    }
    if (Object.keys(patch).length === 0) {
      return this.findGreetingReactionById(id);
    }
    const [row] = await this.db
      .update(greeting_reaction)
      .set(patch)
      .where(eq(greeting_reaction.id, id))
      .returning();
    return row ?? null;
  }

  async deleteGreetingReaction(id: string): Promise<boolean> {
    const deleted = await this.db
      .delete(greeting_reaction)
      .where(eq(greeting_reaction.id, id))
      .returning({ id: greeting_reaction.id });
    return deleted.length > 0;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
