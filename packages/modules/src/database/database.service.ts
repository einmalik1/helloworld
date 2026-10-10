import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { CreateChannel, UpdateChannel } from "@helloworld/types/api";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import {
  deleteChannel,
  findChannelById,
  insertChannel,
  listChannels,
  updateChannel,
  type ChannelRow,
} from "./channel-queries.js";
import * as schema from "./schema-entry.js";

export type AppDatabase = PostgresJsDatabase<typeof schema>;
export type { ChannelRow };
export { UniqueConstraintError } from "./channel-queries.js";

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

  insertChannel(input: CreateChannel): Promise<ChannelRow> {
    return insertChannel(this.db, input);
  }

  findChannelById(id: string): Promise<ChannelRow | null> {
    return findChannelById(this.db, id);
  }

  listChannels(
    page: number,
    limit: number,
  ): Promise<{ items: ChannelRow[]; total: number }> {
    return listChannels(this.db, page, limit);
  }

  updateChannel(id: string, input: UpdateChannel): Promise<ChannelRow | null> {
    return updateChannel(this.db, id, input);
  }

  deleteChannel(id: string): Promise<boolean> {
    return deleteChannel(this.db, id);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
