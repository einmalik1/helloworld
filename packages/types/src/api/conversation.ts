/**
 * Generated API Zod schemas — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";
import { ConversationSchema } from "../schema/conversation.js";

export const CreateConversationSchema = ConversationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});


export const UpdateConversationSchema = CreateConversationSchema.partial();

export const ConversationResponseSchema = ConversationSchema;

export type CreateConversation = z.infer<typeof CreateConversationSchema>;
export type UpdateConversation = z.infer<typeof UpdateConversationSchema>;
export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;
