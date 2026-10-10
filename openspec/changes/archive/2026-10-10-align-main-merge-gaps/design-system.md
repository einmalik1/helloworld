# Design System

## Summary

Seed the durable UI-language SoT so web choices from merged tech-stack (shadcn/Tailwind, driver.js, Cytoscape-as-API-consumer) are not only in `tech-stack.md`.

## Durable updates

- `openspec/design-system/README.md` — baseline kit, tours, graph viz rules, what stays out of scope
- Optional short `openspec/design-system/web-baseline.md` if README would be too dense (prefer single README unless needed)

## Out of scope (screen-specific)

- Full chat UI (follow-up Chat change)
- Pixel-perfect token tables / every shadcn component inventory
- Implementing Cytoscape explorer screens (behaviour in `search-knowledge-graph`; viz library noted here)

## Notes

Graph data access remains API-only; Cytoscape is a consumer, not a second backend.
