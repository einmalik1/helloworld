-- ============================================================================
-- Hello World — Data Model (Single Source of Truth for DDL)
-- ============================================================================
-- This file IS the authoritative DDL for tooling and diagrams.
-- Domain rationale lives in CONTEXT.md and openspec/features/*; when the two
-- diverge: fix here OR update the spec — never let them drift silently.
--
-- Rules for this file (the parser relies on them):
--   * One statement per `;`; statements may span multiple lines.
--   * Column and table constraints: one element per line.
--   * COMMENT ON TABLE carries metadata: category | label | spec | desc.
--   * Category keys must exist in spark/repo-profile.yaml → generators.categories
--     (labels/colors are defined there — not via -- @category in this file).
--   * No seed data, no GRANTs, no DROP statements.
--
-- Regenerate (full pipeline including client when openapi.json exists):
--   pnpm generate
-- Code stages only:
--   pnpm generate:code
--     (= python3 spark/generators/run.py)
--
-- Output: paths from spark/repo-profile.yaml generators.*
--   Edit only this file and the profile by hand; generated/ is overwritten.
--
-- Demo model: person / channel / greeting / greeting_reaction (relations for ERD).

CREATE TABLE person (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email)
);

COMMENT ON TABLE person IS 'category: core | label: Person | spec: openspec/features/README.md | desc: Someone who authors greetings or reacts to them';
COMMENT ON COLUMN person.display_name IS 'Public name shown next to greetings';
COMMENT ON COLUMN person.email IS 'Unique contact address';

CREATE TABLE channel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug)
);

COMMENT ON TABLE channel IS 'category: core | label: Channel | spec: openspec/features/README.md | desc: Surface where greetings are published (web, cli, …)';
COMMENT ON COLUMN channel.slug IS 'Stable machine key for the channel';
COMMENT ON COLUMN channel.name IS 'Human-readable channel title';

CREATE TABLE greeting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES person (id) ON DELETE CASCADE,
  channel_id uuid NOT NULL REFERENCES channel (id) ON DELETE RESTRICT,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE greeting IS 'category: core | label: Greeting | spec: openspec/features/README.md | desc: A hello message posted by a person on a channel';
COMMENT ON COLUMN greeting.author_id IS 'Person who wrote the greeting';
COMMENT ON COLUMN greeting.channel_id IS 'Channel where the greeting appears';
COMMENT ON COLUMN greeting.message IS 'Display text of the greeting';

CREATE TABLE greeting_reaction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  greeting_id uuid NOT NULL REFERENCES greeting (id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES person (id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (greeting_id, person_id, emoji)
);

COMMENT ON TABLE greeting_reaction IS 'category: social | label: Greeting reaction | spec: openspec/features/README.md | desc: Emoji reaction from a person on a greeting';
COMMENT ON COLUMN greeting_reaction.greeting_id IS 'Greeting being reacted to';
COMMENT ON COLUMN greeting_reaction.person_id IS 'Person who reacted';
COMMENT ON COLUMN greeting_reaction.emoji IS 'Reaction emoji (e.g. thumbs-up)';
