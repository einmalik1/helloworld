# Spec Delta

## MODIFIED Requirements

### Requirement: schema.sql remains DDL source of truth
Domain table definitions MUST be authored in `openspec/data-model/schema.sql`. Generated artifacts and ORM schemas MUST derive from that file (or an explicitly documented pipeline fed by it), and silent drift between SQL and runtime schema is forbidden.

#### Scenario: Domain table change starts in SQL
- **WHEN** a developer adds or alters a domain table
- **THEN** the change is made in `openspec/data-model/schema.sql` before application code relies on the new shape
