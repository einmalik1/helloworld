/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate:drizzle
 */

import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { greeting } from "./greeting.js";
import { person } from "./person.js";

export const greeting_reaction = pgTable("greeting_reaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  greeting_id: uuid("greeting_id").notNull().references(() => greeting.id, { onDelete: "cascade" }), // Greeting being reacted to
  person_id: uuid("person_id").notNull().references(() => person.id, { onDelete: "cascade" }), // Person who reacted
  emoji: text("emoji").notNull(), // Reaction emoji (e.g. thumbs-up)
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    unique("greeting_reaction_unique").on(t.greeting_id, t.person_id, t.emoji),
]);
