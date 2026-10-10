/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate:drizzle
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { channel } from "./channel.js";
import { person } from "./person.js";

export const greeting = pgTable("greeting", {
  id: uuid("id").primaryKey().defaultRandom(),
  author_id: uuid("author_id").notNull().references(() => person.id, { onDelete: "cascade" }), // Person who wrote the greeting
  channel_id: uuid("channel_id").notNull().references(() => channel.id, { onDelete: "restrict" }), // Channel where the greeting appears
  message: text("message").notNull(), // Display text of the greeting
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
