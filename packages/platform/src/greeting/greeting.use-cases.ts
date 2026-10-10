import type { AppDatabase } from "@helloworld/modules";
import { greeting } from "@helloworld/modules/database/schema";
import type { CreateGreeting, GreetingResponse, UpdateGreeting } from "@helloworld/types/api";
import { DatabaseError, NotFound } from "@helloworld/types";
import { count, desc, eq } from "drizzle-orm";
import { err, ok, type Result } from "neverthrow";

import { mapGreetingDbError } from "./map-db-error.js";

export type ListGreetingsQuery = {
  page?: number;
  limit?: number;
  channel_id?: string;
};

export type ListGreetingsPage = {
  items: GreetingResponse[];
  total: number;
  page: number;
  limit: number;
};

function toGreeting(row: typeof greeting.$inferSelect): GreetingResponse {
  return {
    id: row.id,
    author_id: row.author_id,
    channel_id: row.channel_id,
    message: row.message,
    created_at: row.created_at,
  };
}

export async function createGreeting(
  db: AppDatabase,
  input: CreateGreeting,
): Promise<Result<GreetingResponse, DatabaseError | NotFound>> {
  try {
    const [row] = await db
      .insert(greeting)
      .values({
        author_id: input.author_id,
        channel_id: input.channel_id,
        message: input.message,
      })
      .returning();
    if (!row) {
      return err(new DatabaseError("Greeting insert returned no row"));
    }
    return ok(toGreeting(row));
  } catch (error) {
    return err(mapGreetingDbError(error));
  }
}

export async function getGreeting(
  db: AppDatabase,
  id: string,
): Promise<Result<GreetingResponse, DatabaseError | NotFound>> {
  try {
    const [row] = await db.select().from(greeting).where(eq(greeting.id, id)).limit(1);
    if (!row) {
      return err(new NotFound("Greeting not found"));
    }
    return ok(toGreeting(row));
  } catch (error) {
    return err(mapGreetingDbError(error));
  }
}

export async function listGreetings(
  db: AppDatabase,
  query: ListGreetingsQuery = {},
): Promise<Result<ListGreetingsPage, DatabaseError>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const filter = query.channel_id ? eq(greeting.channel_id, query.channel_id) : undefined;

  try {
    const [totalRow] = await db.select({ value: count() }).from(greeting).where(filter);
    const rows = await db
      .select()
      .from(greeting)
      .where(filter)
      .orderBy(desc(greeting.created_at))
      .limit(limit)
      .offset((page - 1) * limit);

    return ok({
      items: rows.map(toGreeting),
      total: Number(totalRow?.value ?? 0),
      page,
      limit,
    });
  } catch (error) {
    const mapped = mapGreetingDbError(error);
    if (mapped instanceof DatabaseError) {
      return err(mapped);
    }
    return err(new DatabaseError("Greeting list failed", error));
  }
}

export async function updateGreeting(
  db: AppDatabase,
  id: string,
  input: UpdateGreeting,
): Promise<Result<GreetingResponse, DatabaseError | NotFound>> {
  if (Object.keys(input).length === 0) {
    return getGreeting(db, id);
  }

  try {
    const [row] = await db
      .update(greeting)
      .set({
        ...(input.author_id !== undefined ? { author_id: input.author_id } : {}),
        ...(input.channel_id !== undefined ? { channel_id: input.channel_id } : {}),
        ...(input.message !== undefined ? { message: input.message } : {}),
      })
      .where(eq(greeting.id, id))
      .returning();
    if (!row) {
      return err(new NotFound("Greeting not found"));
    }
    return ok(toGreeting(row));
  } catch (error) {
    return err(mapGreetingDbError(error));
  }
}

export async function deleteGreeting(
  db: AppDatabase,
  id: string,
): Promise<Result<void, DatabaseError | NotFound>> {
  try {
    const deleted = await db.delete(greeting).where(eq(greeting.id, id)).returning({
      id: greeting.id,
    });
    if (deleted.length === 0) {
      return err(new NotFound("Greeting not found"));
    }
    return ok(undefined);
  } catch (error) {
    return err(mapGreetingDbError(error));
  }
}
