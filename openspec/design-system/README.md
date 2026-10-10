# Design System

Durable **UI language** for Hello World: kit baseline, shared contracts, and visual rules.

Screen-specific flows stay in OpenSpec changes (tasks/attachments), not here.  
Product vs delivery map: [`../README.md`](../README.md).

## Web kit baseline

| Piece | Choice | Notes |
|---|---|---|
| Components | **shadcn/ui** | CLI-copied into `apps/web`; not a runtime npm “UI framework” lock-in beyond what we copy |
| Styling | **Tailwind CSS 4** | Utility-first; tokens via CSS variables as shadcn expects |
| Tours | **driver.js** | Product tours / feature intros; import vendor CSS once at app shell |
| Graph viz | **Cytoscape.js** | Consumes **product API** `{ nodes, edges }` JSON only — never AGE Cypher or Typesense protocols from the browser |

Inventory versions: [`../tech-stack.md`](../tech-stack.md).

## Rules

1. **One kit** — prefer shadcn primitives before inventing parallel button/input systems.
2. **No provider chrome** — LLM/chat UIs must not surface vendor branding as product brand.
3. **Graph ≠ Chat** — graph explorer and chat panel are separate compositions in v1.
4. **Data access** — browsers talk to `apps/api` / `apps/chat` product HTTP; not engines.

## Chat UI

Message list + composer + streaming assistant tokens. Reuse the kit above when the Vite/React shell lands. Interim static client: `apps/web/chat.html` → `apps/chat` only (no vendor LLM URLs). See [ADR 0008](../decisions/0008-chat-service-app.md).

## Out of scope here

Full token tables, every shadcn component inventory, marketing landing layouts.
