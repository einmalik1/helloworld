/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate:drizzle
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const person = pgTable("person", {
  id: uuid("id").primaryKey().defaultRandom(),
  display_name: text("display_name").notNull(), // Public name shown next to greetings
  email: text("email").notNull().unique(), // Unique contact address
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
