/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm erd:build
 */
import { z } from "zod";

export const ChannelSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string(), // Stable machine key for the channel
  name: z.string(), // Human-readable channel title
  created_at: z.coerce.date().optional(),
});

export type Channel = z.infer<typeof ChannelSchema>;
