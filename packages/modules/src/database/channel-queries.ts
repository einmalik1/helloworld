import { and, count, eq, ne, sql } from "drizzle-orm";
import type { CreateChannel, UpdateChannel } from "@helloworld/types/api";

import type { AppDatabase } from "./database.service.js";
import { channel } from "./schema/channel.js";

export type ChannelRow = {
  id: string;
  slug: string;
  name: string;
  created_at: Date;
};

export class UniqueConstraintError extends Error {
  readonly field: string;

  constructor(field: string, message = `Unique constraint violated on ${field}`) {
    super(message);
    this.name = "UniqueConstraintError";
    this.field = field;
  }
}

function isPostgresUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const code = "code" in error ? (error as { code: unknown }).code : undefined;
  return code === "23505";
}

function mapUnique(error: unknown, field: string): never {
  if (isPostgresUniqueViolation(error)) {
    throw new UniqueConstraintError(field);
  }
  throw error;
}

export async function insertChannel(
  db: AppDatabase,
  input: CreateChannel,
): Promise<ChannelRow> {
  try {
    const [row] = await db
      .insert(channel)
      .values({ slug: input.slug, name: input.name })
      .returning();
    if (!row) {
      throw new Error("insert channel returned no row");
    }
    return row;
  } catch (error) {
    mapUnique(error, "slug");
  }
}

export async function findChannelById(
  db: AppDatabase,
  id: string,
): Promise<ChannelRow | null> {
  const [row] = await db.select().from(channel).where(eq(channel.id, id)).limit(1);
  return row ?? null;
}

export async function listChannels(
  db: AppDatabase,
  page: number,
  limit: number,
): Promise<{ items: ChannelRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const [totalRow] = await db.select({ value: count() }).from(channel);
  const items = await db
    .select()
    .from(channel)
    .orderBy(sql`${channel.created_at} asc`)
    .limit(limit)
    .offset(offset);
  return { items, total: Number(totalRow?.value ?? 0) };
}

export async function updateChannel(
  db: AppDatabase,
  id: string,
  input: UpdateChannel,
): Promise<ChannelRow | null> {
  if (input.slug === undefined && input.name === undefined) {
    return findChannelById(db, id);
  }

  try {
    if (input.slug !== undefined) {
      const [conflict] = await db
        .select({ id: channel.id })
        .from(channel)
        .where(and(eq(channel.slug, input.slug), ne(channel.id, id)))
        .limit(1);
      if (conflict) {
        throw new UniqueConstraintError("slug");
      }
    }

    const [row] = await db
      .update(channel)
      .set({
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
      })
      .where(eq(channel.id, id))
      .returning();
    return row ?? null;
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw error;
    }
    mapUnique(error, "slug");
  }
}

export async function deleteChannel(db: AppDatabase, id: string): Promise<boolean> {
  const deleted = await db.delete(channel).where(eq(channel.id, id)).returning({
    id: channel.id,
  });
  return deleted.length > 0;
}
