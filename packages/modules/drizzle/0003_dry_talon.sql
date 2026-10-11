CREATE TABLE "impex_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"resource" text NOT NULL,
	"direction" text NOT NULL,
	"format" text NOT NULL,
	"status" text NOT NULL,
	"object_key" text,
	"error_summary" text,
	"job_id" uuid,
	"rows_total" integer,
	"rows_error" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
