/**
 * Generated from schema-model.json — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";

export const SearchSyncOutboxSchema = z.object({
  id: z.uuid().optional(),
  aggregate_type: z.string(), // person | channel | greeting | reaction
  aggregate_id: z.uuid(), // Domain entity UUID being projected
  op: z.string(), // upsert | delete
  payload: z.unknown().optional(), // Optional snapshot for upsert projection
  created_at: z.coerce.date().optional(),
  processed_at: z.coerce.date().optional(), // Set when worker finishes applying the row
});

export type SearchSyncOutbox = z.infer<typeof SearchSyncOutboxSchema>;
