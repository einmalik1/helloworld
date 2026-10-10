/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";

export const PersonSchema = z.object({
  id: z.uuid().optional(),
  display_name: z.string(), // Public name shown next to greetings
  email: z.string(), // Unique contact address
  created_at: z.coerce.date().optional(),
});

export type Person = z.infer<typeof PersonSchema>;
