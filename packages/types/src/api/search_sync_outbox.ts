/**
 * Generated API Zod schemas — do not edit by hand.
 * Regenerate: pnpm generate
 */
import { z } from "zod";
import { SearchSyncOutboxSchema } from "../schema/search_sync_outbox.js";

export const CreateSearchSyncOutboxSchema = SearchSyncOutboxSchema.omit({
  id: true,
  created_at: true,
});

export const UpdateSearchSyncOutboxSchema = CreateSearchSyncOutboxSchema.partial();

export const SearchSyncOutboxResponseSchema = SearchSyncOutboxSchema;

export type CreateSearchSyncOutbox = z.infer<typeof CreateSearchSyncOutboxSchema>;
export type UpdateSearchSyncOutbox = z.infer<typeof UpdateSearchSyncOutboxSchema>;
export type SearchSyncOutboxResponse = z.infer<typeof SearchSyncOutboxResponseSchema>;
