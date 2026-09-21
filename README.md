# MerhabaMap

**The Home for Turkish Communities**

MerhabaMap is a bilingual German–Turkish community platform for discovering places, events and local connections across Germany.

The project addresses a gap in mainstream local-discovery products: culturally relevant, bilingual and privacy-conscious discovery for the Turkish diaspora. MerhabaMap launched in June 2026, reached approximately 700 registered users during its first month and covers more than 100 German cities.

## What MerhabaMap provides

- place and local-business discovery
- event discovery
- German and Turkish user experiences
- profiles, saved content and community interactions
- community submissions and moderation workflows
- privacy-aware location handling at city level

## Technology

- TypeScript
- Next.js and React
- PostgreSQL and Prisma
- Supabase Auth and Row Level Security
- Capacitor for iOS and Android
- npm workspaces

## Open-source scope

This repository is a clean, contributor-facing snapshot of MerhabaMap. It intentionally starts with a fresh Git history.

The public repository does **not** contain production data, credentials, private ingestion systems, internal incident records or sensitive operational runbooks. Example configuration uses placeholders only.

## Repository layout

```text
apps/
  web/               Next.js application
packages/
  shared/            Platform-neutral types and pure logic
  api-client/        Typed client for app-facing APIs
docs/
  public/             Contributor-facing architecture and project documentation
```

## Local development

### Prerequisites

- Node.js 20 or a current LTS release
- npm
- PostgreSQL

### Setup

```bash
git clone https://github.com/rdmfl03/merhabamap-open-source.git
cd merhabamap-open-source
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

Only use local or disposable development services. Never connect an unreviewed checkout to production infrastructure.

## Quality

Typical checks are:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Security and privacy

MerhabaMap handles user-generated and location-related content. Security, abuse prevention and GDPR compliance are core design principles.

Do not publish secrets, real user data or private infrastructure details. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

Source code in this repository is available under the [MIT License](LICENSE). Third-party names, trademarks, datasets and media remain subject to their respective rights and licenses.
