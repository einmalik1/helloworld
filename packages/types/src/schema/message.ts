/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";

export const MessageSchema = z.object({
  id: z.uuid().optional(),
  conversation_id: z.uuid(), // Parent conversation
  role: z.string(), // user | assistant | system | tool
  content: z.string(), // Message text (tool payloads may be serialized text in v1)
  created_at: z.coerce.date().optional(),
});

export type Message = z.infer<typeof MessageSchema>;
