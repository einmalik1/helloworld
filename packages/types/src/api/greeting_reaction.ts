/**
 * Generated API Zod schemas — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";
import { GreetingReactionSchema } from "../schema/greeting_reaction.js";

export const CreateGreetingReactionSchema = GreetingReactionSchema.omit({
  id: true,
  created_at: true,
});


export const UpdateGreetingReactionSchema = CreateGreetingReactionSchema.partial();

export const GreetingReactionResponseSchema = GreetingReactionSchema;

export type CreateGreetingReaction = z.infer<typeof CreateGreetingReactionSchema>;
export type UpdateGreetingReaction = z.infer<typeof UpdateGreetingReactionSchema>;
export type GreetingReactionResponse = z.infer<typeof GreetingReactionResponseSchema>;
