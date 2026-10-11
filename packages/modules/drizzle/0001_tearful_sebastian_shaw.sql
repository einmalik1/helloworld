CREATE TABLE "search_sync_outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"op" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "search_sync_outbox_check" CHECK ( aggregate_type IN ('person', 'channel', 'greeting', 'reaction') AND op IN ('upsert', 'delete') )
);
--> statement-breakpoint
CREATE INDEX "search_sync_outbox_pending_idx" ON "search_sync_outbox" USING btree ("created_at");