/**
 * Generated API Zod schemas — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";
import { GreetingSchema } from "../schema/greeting.js";

export const CreateGreetingSchema = GreetingSchema.omit({
  id: true,
  created_at: true,
});


export const UpdateGreetingSchema = CreateGreetingSchema.partial();

export const GreetingResponseSchema = GreetingSchema;

export type CreateGreeting = z.infer<typeof CreateGreetingSchema>;
export type UpdateGreeting = z.infer<typeof UpdateGreetingSchema>;
export type GreetingResponse = z.infer<typeof GreetingResponseSchema>;
