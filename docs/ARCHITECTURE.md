# Public Architecture

MerhabaMap is developed as a German–Turkish community platform with web and mobile clients backed by typed APIs and PostgreSQL-based services.

## Public packages

### `@merhabamap/shared`

Pure, platform-neutral map types and clustering algorithms. The package has no DOM dependency and can be reused by web and native renderers.

### `@merhabamap/community-core`

Deterministic consent and pre-moderation primitives. Optional purposes default to off, and moderation rules can be extended by callers without exposing environment configuration.

## Trust boundaries

The public packages do not contain:

- database credentials or production identifiers
- privileged service-role operations
- private ingestion or automation pipelines
- production user data
- deployment and incident-response runbooks

The production application consumes equivalent building blocks behind additional authentication, authorization, rate-limiting and audit controls.
