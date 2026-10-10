/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate:drizzle
 */

import { check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { conversation } from "./conversation.js";

export const message = pgTable("message", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id").notNull().references(() => conversation.id, { onDelete: "cascade" }), // Parent conversation
  role: text("role").notNull(), // user | assistant | system | tool
  content: text("content").notNull(), // Message text (tool payloads may be serialized text in v1)
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
    check("message_check", sql`role IN ('user', 'assistant', 'system', 'tool')`),
    index("message_conversation_created_idx").on(t.conversation_id, t.created_at),
]);
