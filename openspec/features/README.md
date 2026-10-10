# Features

One markdown file per feature (`kebab-case.md`). Describe behaviour and acceptance criteria here.

Link tables in `openspec/data-model/schema.sql` via `COMMENT ON TABLE … IS '… | spec: openspec/features/<file>.md | …'`.

OpenSpec capabilities (after `spec-baseline` archive) live under `openspec/specs/<id>/`.

| Feature | Spec | OpenSpec capability |
|---|---|---|
| Person | [`person.md`](person.md) | `domain-person` |
| Channel | [`channel.md`](channel.md) | `domain-channel` |
| Greeting | [`greeting.md`](greeting.md) | `domain-greeting` |
| Greeting reaction | [`greeting-reaction.md`](greeting-reaction.md) | `domain-greeting-reaction` |
| Impex (import / export) | [`impex.md`](impex.md) | `impex` |
