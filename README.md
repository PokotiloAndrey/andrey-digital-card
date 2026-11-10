# Developer card API — Андрей Покотило

A small, reviewable backend application built with **TypeScript, NestJS, GraphQL, Apollo Sandbox, Prisma, PostgreSQL and Docker**. This is a self-contained technical assignment, not a frontend website.

## Quick start

Requirements: Docker Desktop (Compose v2) and Git.

```bash
git clone <YOUR-PUBLISHED-REPO-URL>
cd andrey-digital-card
# Optional: supply your own non-demo DB password in .env as POSTGRES_PASSWORD=...
docker compose up -d --build
```

On a machine without the published repository, extract the ZIP, open its directory and run `docker compose up -d --build`.

- **Apollo Sandbox:** `http://localhost:3000/graphql`
- **DB-aware healthcheck:** `http://localhost:3000/health`
- **Logs:** `docker compose logs -f api`
- **Stop:** `docker compose down`
- **Reset all local data (destructive!):** `docker compose down -v`

The app waits for Postgres to become healthy. At every startup it applies checked-in migrations, executes an **idempotent seed** and starts the server. Data is stored in a named Docker volume; restarting containers does not erase it.

> The Compose password defaults to `local_only_change_me` for a local demonstration. **Set a strong `POSTGRES_PASSWORD` before any public deployment.** The local DB is not published as a host port.

## Example query

Paste into Apollo Sandbox and run:

```graphql
query DeveloperCard {
  profile {
    name
    description
    githubUrl
    portfolioUrl
    skills { name category }
    experience { company position period achievements }
    projects { name description url }
  }
}
```

Nested queries can also be selective:

```graphql
query SkillsOnly { profile { name skills { name } } }
```

Command-line check after the containers start:

```bash
node scripts/smoke.mjs
```

Or raw curl:

```bash
curl -s http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ profile { name skills { name } } }"}'
```

## Architecture / engineering decisions

```text
src/
  app.module.ts             Composition root; Apollo Sandbox; request-scoped loaders
  main.ts                   HTTP bootstrap
  profiles/
    models.ts               Public GraphQL types (code first)
    profiles.resolver.ts    Query/field orchestration only
    profiles.service.ts     Profile application query
    profile.loaders.ts      Request-scoped relation batching / cache
    profiles.module.ts      Feature boundary
  prisma/                   Injectable Prisma client and lifecycle
  scripts/seed.ts           Deterministic idempotent data bootstrap
  health/                   Database-backed readiness check
prisma/
  schema.prisma             Relational schema
  migrations/               Checked-in SQL migration
scripts/smoke.mjs           API smoke test
 tests/                     DataLoader unit tests
Dockerfile                  Multi-stage build
compose.yaml                Postgres + API, healthchecks and persistent volume
```

**Separation of responsibilities:** the resolver maps GraphQL requests to the service/field loaders. The service queries the public profile. Prisma owns persistence. Seeding is a separate startup step, not a side effect of the GraphQL request. Schema migrations are versioned instead of generated dynamically in production.

**Nested GraphQL optimization:** `profile` reads only the Profile row. `skills`, `experience` and `projects` are fetched **only if the corresponding GraphQL fields are selected**. Each field uses a **new request-scoped DataLoader**, grouping keys into one SQL query per relation. This avoids N+1 as the schema expands to multiple parent profiles and prevents cross-request cache bleed. The loaders return results in the same order as their requested parent IDs. The current API intentionally serves a single public profile; there is no unnecessary global user directory.

**Data design:** separate related tables with FKs and indexes on `profileId`, deterministic IDs for seeding, unique `(profileId, name)` for skills, cascade deletion for owned rows. No destructive truncate at boot; repeated seeds use `upsert`, so a restart is safe. The seed writes a coherent snapshot in a single transaction.

**API design:** GraphQL code-first decorators derive the schema from typed class definitions. `profile` is a read-only public endpoint. No mutation/authentication is added because this exercise is a public digital card, not a profile-management SaaS. No secrets are included in source files.

**Operational behavior:** PostgreSQL healthcheck gates application start, migration/seed errors prevent the API from launching, and the `/health` endpoint checks DB connectivity. The container restarts on failure. In a larger system migrations would run as a separate deployment job to avoid races across replicas.

**Apollo driver:** `ApolloDriver` is specified on the outer `GraphQLModule.forRootAsync` options, as required by `@nestjs/graphql` v12.

**Apollo Sandbox:** explicitly configured with the official `ApolloServerPluginLandingPageLocalDefault` plugin and `playground: false` for the NestJS 10 / Apollo Server 4 integration.

## Running without Compose (optional)

1. Start your own PostgreSQL database and configure `DATABASE_URL` from `.env.example`.
2. `npm install`
3. `npm run db:generate`
4. `npx prisma migrate deploy`
5. `npm run build`
6. `npm run db:seed`
7. `npm start`

## Tests and maintainability

```bash
npm install
npm run db:generate
npm run typecheck
npm test
npm run build
# with the running containers:
npm run test:smoke
```

The unit tests use a mock Prisma repository to verify batching, ordering and request-local caching without requiring PostgreSQL. The smoke test checks the actual HTTP GraphQL response once the app is started.

## Personal data accuracy

The seed identifies the author as **Андрей Покотило** and links only to the two provided public repositories. Experience is explicitly described as **project work in 2026**, not fabricated employment, titles, or exact months. The non-public AI Churn Analysis project has no invented URL. **Review and amend `src/scripts/seed.ts` before submitting** if you want to specify independently verifiable employers, positions and exact dates.

## Deploying to a public URL

The assignment requests **two** URLs: a publicly accessible running API and a Git repository. A ZIP by itself is neither.

1. Create an empty public Git repository, `git init`, `git add .`, commit and push the files. Do not commit `.env` or credentials.
2. Provision a persistent PostgreSQL database and an application instance on a Docker-capable host (e.g. Railway/Render/VPS); set `DATABASE_URL`, `PORT` and any deployment-specific variables. For a production host supply a strong DB password and managed TLS/HTTPS.
3. Build using the included `Dockerfile`, whose entrypoint automatically runs the migration and seed. Confirm `/health` returns `{"status":"ok"}` and that a nested GraphQL query works in Apollo Sandbox at `/graphql`.
4. Submit both the actual HTTPS endpoint and your Git URL to the employer.

For an interview, be ready to extend the schema (new field in `models.ts` and Prisma), write a migration, update the seed, and run the smoke/unit tests while sharing your screen.

## Security note on employer conditions

Minute-by-minute screen captures can expose passwords, private chats, customer data, authentication codes and financial information. Before accepting the position, ask who will access screenshots, for how long they are stored, how they are encrypted and deleted, how payments can be **withdrawn to your own account**, whether the 'internal balance' is merely an accounting ledger, and what written agreement governs the relationship. Never pay a fee to withdraw salary or reveal a seed phrase/private key.
