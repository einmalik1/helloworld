/**
 * Generated API Zod schemas — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";
import { PersonSchema } from "../schema/person.js";

export const CreatePersonSchema = PersonSchema.omit({
  id: true,
  created_at: true,
});


export const UpdatePersonSchema = CreatePersonSchema.partial();

export const PersonResponseSchema = PersonSchema;

export type CreatePerson = z.infer<typeof CreatePersonSchema>;
export type UpdatePerson = z.infer<typeof UpdatePersonSchema>;
export type PersonResponse = z.infer<typeof PersonResponseSchema>;
