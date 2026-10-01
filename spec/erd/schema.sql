-- ============================================================================
-- Hello World — Data Model (Single Source of Truth)
-- ============================================================================
-- This file IS the authoritative data model for tooling and diagrams.
-- Domain rationale lives in CONTEXT.md and spec/features/*; when the two
-- diverge: fix here OR update the spec — never let them drift silently.
--
-- Rules for this file (the parser relies on them):
--   * One statement per `;`; statements may span multiple lines.
--   * Column and table constraints: one element per line.
--   * COMMENT ON TABLE carries metadata: category | label | spec | desc.
--   * No seed data, no GRANTs, no DROP statements.
--
-- Regenerate diagrams + HTML viewer:
--   pnpm erd:build
--     (= spark/scripts/erd/parse-schema.ts + generate-diagrams.ts)
--
-- Output: spec/erd/generated/ (Mermaid, draw.io, erd.html)
--   Edit only this file by hand; generated/ is overwritten.
--
-- Category palette (read by the ERD parser — not SQL, must stay as -- comments):
--   -- @category <key> | label: <Label> | color: <#rrggbb>
-- @category core | label: Core | color: #2563eb
--
-- Starter example (replace with your domain):

CREATE TABLE greetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE greetings IS 'category: core | label: Greeting | spec: spec/features/README.md | desc: Example greeting row for the template';
COMMENT ON COLUMN greetings.message IS 'Display text of the greeting';
