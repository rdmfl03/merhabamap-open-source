# MerhabaMap

**The Home for Turkish Communities**

MerhabaMap is a bilingual German–Turkish community platform for discovering places, events and local connections across Germany.

The project addresses a gap in mainstream local-discovery products: culturally relevant, bilingual and privacy-conscious discovery for the Turkish diaspora. MerhabaMap launched in June 2026, reached approximately 700 registered users during its first month and covers more than 100 German cities.

## What is open here

This repository is a clean, contributor-facing open-source snapshot. It intentionally starts with fresh Git history and currently contains reusable, production-derived building blocks:

- platform-neutral map marker and clustering logic
- privacy-preserving consent parsing
- deterministic pre-moderation and safe URL tokenization
- automated tests and continuous integration
- public architecture, security and contribution documentation

The production application, production data, private ingestion systems, deployment credentials, incident records and sensitive operational runbooks are not included.

## Repository layout

```text
packages/
  shared/            Platform-neutral map types and clustering
  community-core/    Consent and pre-moderation primitives
tests/                Public package tests
docs/                 Public project and architecture documentation
```

## Local development

Requirements:

- Node.js 20 or a current LTS release
- npm

```bash
git clone https://github.com/rdmfl03/merhabamap-open-source.git
cd merhabamap-open-source
npm install
npm run typecheck
npm test
```

No production credentials or services are required.

## Security and privacy

MerhabaMap handles user-generated and location-related content. Security, abuse prevention and GDPR compliance are core design principles.

Do not publish secrets, real user data or private infrastructure details. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.

## Public snapshot policy

Every import from the private production repository must pass a public-readiness review. See [docs/PUBLIC_SNAPSHOT.md](docs/PUBLIC_SNAPSHOT.md).

## License

Source code in this repository is available under the [MIT License](LICENSE). Third-party names, trademarks, datasets and media remain subject to their respective rights and licenses.
