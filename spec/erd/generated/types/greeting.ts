/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";

export const GreetingSchema = z.object({
  id: z.uuid().optional(),
  author_id: z.uuid(), // Person who wrote the greeting
  channel_id: z.uuid(), // Channel where the greeting appears
  message: z.string(), // Display text of the greeting
  created_at: z.coerce.date().optional(),
});

export type Greeting = z.infer<typeof GreetingSchema>;
