/**
 * Generated API Zod schemas — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";
import { ChannelSchema } from "../schema/channel.js";

export const CreateChannelSchema = ChannelSchema.omit({
  id: true,
  created_at: true,
});


export const UpdateChannelSchema = CreateChannelSchema.partial();

export const ChannelResponseSchema = ChannelSchema;

export type CreateChannel = z.infer<typeof CreateChannelSchema>;
export type UpdateChannel = z.infer<typeof UpdateChannelSchema>;
export type ChannelResponse = z.infer<typeof ChannelResponseSchema>;
