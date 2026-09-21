# Contributing to MerhabaMap

Thank you for helping improve bilingual, privacy-conscious community infrastructure.

## Before you start

- Keep the Germany-first and German–Turkish context intact.
- Do not commit secrets, production identifiers, personal data or internal operational material.
- Avoid changes that weaken authentication, moderation, consent or privacy safeguards.
- Open an issue before proposing a large architectural change.

## Setup

```bash
npm install
npm run typecheck
npm test
```

## Pull requests

A pull request should:

- solve one clearly described problem
- include or update tests where practical
- explain privacy and security impact
- preserve backwards compatibility or document the migration
- pass all automated checks

## Public-boundary rule

Do not copy files from private systems directly. New material must be reviewed against [docs/PUBLIC_SNAPSHOT.md](docs/PUBLIC_SNAPSHOT.md).

## Reporting security issues

Never place exploit details or sensitive information in a public issue. Follow [SECURITY.md](SECURITY.md).
