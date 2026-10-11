/**
 * Worker job / outbox / impex_run tables (platform-owned — not generated from schema.sql).
 * Avoids Nest DTO / API CRUD stubs for ops tables. See ADR 0007 / worker-jobs / impex.
 */
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const job = pgTable("job", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown> | null>(),
  error: text("error"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const outbox = pgTable("outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  aggregateType: text("aggregate_type").notNull(),
  aggregateId: uuid("aggregate_id").notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

/** Product-facing impex run status (API); linked to worker `job` rows. */
export const impexRun = pgTable("impex_run", {
  id: uuid("id").primaryKey().defaultRandom(),
  resource: text("resource").notNull(),
  direction: text("direction").notNull(),
  format: text("format").notNull(),
  status: text("status").notNull(),
  objectKey: text("object_key"),
  errorSummary: text("error_summary"),
  jobId: uuid("job_id"),
  rowsTotal: integer("rows_total"),
  rowsError: integer("rows_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});
