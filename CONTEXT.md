# Context — Hello World

Ubiquitous language and domain glossary for this project.

Fill terms as the domain emerges. Specs live under `openspec/`; this file is the shared vocabulary.

## Glossary

| Term          | Meaning                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Person**    | Someone who authors greetings or reacts to them. API: `PersonModule` (`/person`). Spec: [`openspec/features/person.md`](openspec/features/person.md).           |
| **Greeting**  | A hello message posted by a person on a channel. API: `GreetingModule` (`/greeting`). Spec: [`openspec/features/greeting.md`](openspec/features/greeting.md).   |
| **Channel**   | Surface where greetings are published (web, cli, …). Spec: [`openspec/features/channel.md`](openspec/features/channel.md).                                      |
| **Impex**     | Import/export capability for domain resources: files in object storage, processing as background jobs. Spec: [`openspec/features/impex.md`](openspec/features/impex.md). |
| **Impex run** | One import or export execution for a resource (queued → running → terminal state), started via the API.                                                          |
| **Import**    | Load domain data from a file (JSON/CSV) into persistence; worker applies writes after upload to object storage.                                                  |
| **Export**    | Extract domain data to a file in object storage; clients download via the API.                                                                                   |
