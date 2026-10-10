/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate:drizzle
 */

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { person } from "./person.js";

export const conversation = pgTable("conversation", {
  id: uuid("id").primaryKey().defaultRandom(),
  owner_person_id: uuid("owner_person_id").notNull().references(() => person.id, { onDelete: "cascade" }), // Person who owns the conversation
  title: text("title"), // Optional display title
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
