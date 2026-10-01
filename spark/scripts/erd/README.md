# ERD pipeline

```
spec/erd/
  schema.sql          ← hand-edit this file only
  generated/          ← produced by pnpm erd:build (do not edit)
    erd.html
    schema-model.json
    big-picture.mmd
    erd.drawio
    categories/
    entities/
```

## Workflow

1. Edit `spec/erd/schema.sql`
2. Run `pnpm erd:build`
3. Open `spec/erd/generated/erd.html` (also published via `apps/docs`)

## Categories (color + label)

Declare them in the schema header — the parser reads these lines; nothing is hardcoded in the script:

```sql
-- @category auth | label: Auth | color: #dc2626
-- @category content | label: Content | color: #059669
```

Tables reference the key:

```sql
COMMENT ON TABLE story IS 'category: core | label: Story | spec: … | desc: …';
```

Unknown keys → label = key, color = `#64748b`.

## COMMENT metadata

```sql
COMMENT ON TABLE story IS 'category: core | label: Story | spec: … | desc: …';
COMMENT ON COLUMN story.title IS 'Display name of the story';
```

Optional business copy: `businessDescriptions` in `generate-diagrams.ts`.  
Optional markdown tab: `spec/erd/nicht-crud-katalog.md` (missing = empty tab).
