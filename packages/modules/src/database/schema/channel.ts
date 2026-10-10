/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate:drizzle
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const channel = pgTable("channel", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // Stable machine key for the channel
  name: text("name").notNull(), // Human-readable channel title
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
