# Context — Hello World

Ubiquitous language and domain glossary for this project.

Specs live under `spec/`; DDL SoT is [`spec/erd/schema.sql`](spec/erd/schema.sql). When glossary and schema diverge, fix one or the other — do not leave silent drift.

## Demo domain

| Term | Meaning |
|---|---|
| **Person** | Someone who authors greetings or reacts to them |
| **Channel** | Surface where greetings are published (web, cli, …) |
| **Greeting** | A hello message posted by a person on a channel |
| **Greeting reaction** | Emoji reaction from a person on a greeting |
