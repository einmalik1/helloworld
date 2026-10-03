/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";

export const GreetingReactionSchema = z.object({
  id: z.uuid().optional(),
  greeting_id: z.uuid(), // Greeting being reacted to
  person_id: z.uuid(), // Person who reacted
  emoji: z.string(), // Reaction emoji (e.g. thumbs-up)
  created_at: z.coerce.date().optional(),
});

export type GreetingReaction = z.infer<typeof GreetingReactionSchema>;
