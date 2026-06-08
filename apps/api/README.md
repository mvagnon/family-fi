```bash
bun install
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run prisma:migrate
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" \
BETTER_AUTH_SECRET="replace-with-a-32-character-secret" \
bun run dev
```

```bash
open http://localhost:3000
```

OpenAPI documentation:

- JSON spec: `http://localhost:3000/api/openapi.json`.
- Swagger UI: `http://localhost:3000/api/docs` when `NODE_ENV` is not
  `production`.

The API uses Prisma with PostgreSQL. `DATABASE_URL` and
`BETTER_AUTH_SECRET` are required at runtime. Optional auth settings:

- `BETTER_AUTH_URL`: API origin used by Better Auth, default `http://localhost:3000`.
- `WEB_ORIGIN`: credentialed CORS/trusted web origin, default `http://localhost:5173`.
- `OPENAPI_SERVER_URL`: server URL advertised in the generated OpenAPI spec,
  default request origin.
- `ENABLE_DEV_SEED=true`: creates `test@test.com` / `Test2026!`, a personal
  space, default-space settings, and the seed family budget. This is strictly
  for local development and the API refuses to start with this flag when
  `NODE_ENV=production`.

Production deployments must set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`WEB_ORIGIN`, and the web build's `VITE_API_BASE_URL` for the deployed origins.
Do not set `ENABLE_DEV_SEED=true` in production.

Family budget routes are scoped under `/api/spaces/:spaceId/family`.

## Architecture

Feature code under `src/features/*` follows a hexagonal split:

- `domain`: model, ports, and domain errors.
- `application`: use cases and business orchestration.
- `infrastructure`: HTTP and persistence adapters.
- `<layer>/tests`: feature-owned tests, colocated under the layer they verify.

## Docker

Run the dev stack with hot reload from the repository root:

```bash
docker compose up --build api
```

The API source is bind-mounted into the container. Rebuild only when
dependencies change.

Build the production image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t family-fi-api .

docker run --rm \
  -p 3000:3000 \
  -e BETTER_AUTH_SECRET="replace-with-a-32-character-secret" \
  -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/family_fi" \
  family-fi-api
```
