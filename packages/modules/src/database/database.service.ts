import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema-entry.js";

export type AppDatabase = PostgresJsDatabase<typeof schema>;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  /** Raw postgres.js client for AGE Cypher / outbox SQL used by platform adapters. */
  readonly sql: Sql;
  readonly db: AppDatabase;

  constructor(config: ConfigService) {
    const url = config.getOrThrow<string>("DATABASE_URL");
    this.sql = postgres(url);
    this.db = drizzle(this.sql, { schema });
  }

  /** Postgres reachability probe for Terminus / ops. */
  async ping(): Promise<void> {
    await this.sql`select 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}
