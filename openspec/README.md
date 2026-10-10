# OpenSpec & Repo-Karte — Produkt vs. Delivery

Kurz: **Zwei Welten**, jeweils mit **Beschreibung (dauerhaft)** und **Umsetzung (Code/Config)**. Produktarbeit läuft über OpenSpec-Changes; Delivery-Arbeit über `spark/` + CI/Infra.

Schema: **`spec-driven-product`** (Kopie von community `spec-driven-with-adr` + Artifacts `data-model` und `design-system`) — siehe [`schemas/spec-driven-product/`](schemas/spec-driven-product/).

---

## Vier Quadranten

| | **Beschreibung (Soll / Warum)** | **Umsetzung (Ist)** |
|---|---|---|
| **Produkt** | `openspec/` — Verhalten, Data Model, ADRs, Design System, Architecture | `apps/`, `packages/`, `infra/`, `tests/`, `tools/` |
| **Delivery / Workflow** | `spark/` — Prozess, Agent-Regeln, Deploy-Profile, CI/CD-Runbooks | CI-Config, Coolify (über Profile), Generatoren, `turbo`/`pnpm` |

| Zustand | Bedeutung |
|---|---|
| **Dauerhaft gültig** | Was *jetzt* gilt (Specs, ADRs, Data Model, Agent-Regeln, `repo-profile`) |
| **In Arbeit** | `openspec/changes/<name>/` |
| **Historie** | `openspec/changes/archive/` |

---

## Produkt — `openspec/`

```text
openspec/
  README.md                 ← diese Karte
  config.yaml               ← schema: spec-driven-product
  schemas/spec-driven-product/

  specs/<capability>/       ← Verhalten (SHALL + Scenarios)
  data-model/               ← Entities / ERD / schema.sql (+ generated/)
  decisions/                ← Produkt-ADRs
  design-system/            ← UI-Sprache
  architecture.md
  tech-stack.md
  features/                 ← optionale Feature-Prosa

  changes/<name>/           ← in Arbeit
  changes/archive/          ← Historie
```

**Data Model** = Dach für Entities, generiertes ERD, handeditiertes `schema.sql`.

## Delivery — `spark/`

```text
spark/
  process/                  ← requirements, ci-cd, operations, implementation-backlog
  agents/                   ← Multi-Agent-Regeln und Rollen
  repo-profile.yaml         ← Coolify, Generator-Pfade
  generators/               ← pnpm generate
  plans/                    ← retired (Redirect)
```

## Custom Schema pipeline

```text
proposal → specs ∥ design → adr → data-model? → design-system? → tasks → apply → archive
```

| Artifact | Dauerhaft nach |
|---|---|
| specs | `openspec/specs/` (bei Archive) |
| adr | `openspec/decisions/` (+ change-lokales `adr.md`) |
| data-model | `openspec/data-model/` |
| design-system | `openspec/design-system/` |

Root-`spec/` ist nur noch ein Redirect — keine parallele SoT.

## Schnellzuordnung

| Ich will … | Wohin |
|---|---|
| Produktverhalten | `openspec/specs/` (via Change) |
| Entity / SQL / ERD | `openspec/data-model/` |
| Produkt-ADR | `openspec/decisions/` |
| UI-Sprache | `openspec/design-system/` |
| Feature umsetzen | `openspec/changes/<name>/` |
| Prozess / CI / Ops | `spark/process/` |
| Implementierung | `apps/`, `packages/`, `infra/` |

**Ein Fakt — eine SoT.**
