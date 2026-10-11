/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate:drizzle
 */

import { check, index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const search_sync_outbox = pgTable(
  "search_sync_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    aggregate_type: text("aggregate_type").notNull(), // person | channel | greeting | reaction
    aggregate_id: uuid("aggregate_id").notNull(), // Domain entity UUID being projected
    op: text("op").notNull(), // upsert | delete
    payload: jsonb("payload"), // Optional snapshot for upsert projection
    created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    processed_at: timestamp("processed_at", { withTimezone: true }), // Set when worker finishes applying the row
  },
  (t) => [
    check(
      "search_sync_outbox_check",
      sql` aggregate_type IN ('person', 'channel', 'greeting', 'reaction') AND op IN ('upsert', 'delete') `,
    ),
    index("search_sync_outbox_pending_idx").on(t.created_at),
  ],
);
