/**
 * Generated API Zod schemas — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";
import { MessageSchema } from "../schema/message.js";

export const CreateMessageSchema = MessageSchema.omit({
  id: true,
  created_at: true,
});


export const UpdateMessageSchema = CreateMessageSchema.partial();

export const MessageResponseSchema = MessageSchema;

export type CreateMessage = z.infer<typeof CreateMessageSchema>;
export type UpdateMessage = z.infer<typeof UpdateMessageSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
