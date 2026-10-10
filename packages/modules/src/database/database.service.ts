import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { count, desc, eq } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema-entry.js";
import { person } from "./schema/person.js";

export type AppDatabase = PostgresJsDatabase<typeof schema>;

export type PersonRow = {
  id: string;
  display_name: string;
  email: string;
  created_at: Date;
};

export type CreatePersonRow = {
  display_name: string;
  email: string;
};

export type UpdatePersonRow = {
  display_name?: string;
  email?: string;
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

  async insertPerson(input: CreatePersonRow): Promise<PersonRow> {
    const [row] = await this.db
      .insert(person)
      .values({
        display_name: input.display_name,
        email: input.email,
      })
      .returning();
    if (!row) {
      throw new Error("insertPerson returned no row");
    }
    return row;
  }

  async findPersonById(id: string): Promise<PersonRow | null> {
    const [row] = await this.db.select().from(person).where(eq(person.id, id)).limit(1);
    return row ?? null;
  }

  async listPersons(page: number, limit: number): Promise<{ items: PersonRow[]; total: number }> {
    const offset = (page - 1) * limit;
    const [totalRow] = await this.db.select({ value: count() }).from(person);
    const items = await this.db
      .select()
      .from(person)
      .orderBy(desc(person.created_at))
      .limit(limit)
      .offset(offset);
    return { items, total: Number(totalRow?.value ?? 0) };
  }

  async updatePerson(id: string, input: UpdatePersonRow): Promise<PersonRow | null> {
    const patch: Partial<CreatePersonRow> = {};
    if (input.display_name !== undefined) {
      patch.display_name = input.display_name;
    }
    if (input.email !== undefined) {
      patch.email = input.email;
    }
    if (Object.keys(patch).length === 0) {
      return this.findPersonById(id);
    }
    const [row] = await this.db
      .update(person)
      .set(patch)
      .where(eq(person.id, id))
      .returning();
    return row ?? null;
  }

  async deletePerson(id: string): Promise<boolean> {
    const deleted = await this.db.delete(person).where(eq(person.id, id)).returning({ id: person.id });
    return deleted.length > 0;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
