# Public Snapshot Policy

This repository is not a Git mirror of the private production monorepo. It is a reviewed export with a fresh history.

## Required review before import

Every imported file must be checked for:

1. credentials, tokens, private keys and production identifiers
2. personal, customer, contributor or employee data
3. internal infrastructure and incident details
4. third-party assets or datasets without redistribution rights
5. private business logic that is intentionally outside the open-source scope
6. references to unavailable private files or services

## Explicit exclusions

- all historical commits from the production repository
- production and staging environment files
- internal operations and security runbooks
- reports, exports, screenshots and generated operational artifacts
- private ingestion pipelines
- real user or business data
- unreviewed images, audio, fonts and other binary assets

## Update process

Public updates should arrive as reviewed commits or pull requests. Automated one-way synchronization from the private repository is intentionally disabled so that a newly added private file cannot be published accidentally.
