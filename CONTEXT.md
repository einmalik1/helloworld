# Context — Hello World

Ubiquitous language and domain glossary for this project.

Fill terms as the domain emerges. Specs live under `spec/`; this file is the shared vocabulary.

## Glossary

| Term | Meaning |
|---|---|
| **Impex** | Import/export capability for domain resources: files in object storage, processing as background jobs. Spec: [`spec/features/impex.md`](spec/features/impex.md). |
| **Impex run** | One import or export execution for a resource (queued → running → terminal state), started via the API. |
| **Import** | Load domain data from a file (JSON/CSV) into persistence; worker applies writes after upload to object storage. |
| **Export** | Extract domain data to a file in object storage; clients download via the API. |
