/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";

export const ConversationSchema = z.object({
  id: z.uuid().optional(),
  owner_person_id: z.uuid(), // Person who owns the conversation
  title: z.string().optional(), // Optional display title
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

export type Conversation = z.infer<typeof ConversationSchema>;
