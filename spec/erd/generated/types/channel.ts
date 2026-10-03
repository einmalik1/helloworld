/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";

export const ChannelSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string(), // Stable machine key for the channel
  name: z.string(), // Human-readable channel title
  created_at: z.coerce.date().optional(),
});

export type Channel = z.infer<typeof ChannelSchema>;
