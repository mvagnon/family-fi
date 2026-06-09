# family-fi

Turborepo Bun workspace with:

- `apps/web`: React Router app
- `apps/api`: Hono API with Prisma and PostgreSQL

## Local

Before `docker compose up`, create a root `.env` for local Docker development:

```env
POSTGRES_DB=family_fi
POSTGRES_USER=family_fi
POSTGRES_PASSWORD=family_fi
POSTGRES_PORT=5432
CHOKIDAR_USEPOLLING=true
API_PORT=3001
BETTER_AUTH_SECRET=development-only-better-auth-secret-32-chars
BETTER_AUTH_URL=http://localhost:3001
IKI_AUTH_BROWSER_ORIGIN=http://localhost:3000
IKI_AUTH_SERVER_ORIGIN=http://host.docker.internal:3000
IKI_OAUTH_CLIENT_SECRET=development-only-family-fi-oauth-secret
WEB_ORIGIN=http://localhost:5174
WEB_HOST=0.0.0.0
WEB_PORT=5174
VITE_API_BASE_URL=http://localhost:3001
```

Then start the API and frontend:

```bash
bun install
docker compose up --build api
bun run dev
```

The web app runs on `http://localhost:5174`.
The API runs from Docker on `http://localhost:3001`.
Run `../iki` on API `http://localhost:3000` and hub
`http://localhost:5173` before signing in.
When starting the API outside Docker, set `DATABASE_URL`,
`BETTER_AUTH_SECRET`, and `IKI_OAUTH_CLIENT_SECRET` in the shell or API
environment.

Run one package from its app directory when needed:

```bash
cd apps/api && bun run dev
cd apps/web && bun run dev
```

## Docker

Run the Docker development stack for PostgreSQL, Prisma migrations, and the API:

```bash
docker compose up --build api
```

Docker Compose reads `.env` for local configuration and injects it into the API
container. `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` provision the
local Postgres container. The API container receives a derived `DATABASE_URL`
that contains those credentials and points to the local `db` service.

In production, do not use the Compose-only variables unless you also provision
Postgres yourself with Compose. Set the deployed `DATABASE_URL` from the
database provider instead; that URL already contains the database user,
password, host, port, and database name.

Run `../iki` on API `http://localhost:3000` and hub
`http://localhost:5173`. Iki syncs the Family-Fi OAuth client from its
connected-app registry; keep this repo's `IKI_OAUTH_CLIENT_SECRET` equal to
Iki's `FAMILY_FI_OAUTH_CLIENT_SECRET`.

Run the web app with Bun for normal frontend work:

```bash
bun run dev
```

The Docker web service remains available for full-container checks:

```bash
docker compose --profile full up --build web
```

Changes in `apps/api` and shared packages are mounted into the API container and
reload without rebuilding the image.

If dependencies or the local Prisma migration history change, recreate the
Docker volumes:

```bash
docker compose down -v
docker compose up --build api
```

Build one image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t family-fi-api .
docker build -f apps/web/Dockerfile -t family-fi-web .
```

The web image bakes `VITE_API_BASE_URL` at build time:

```bash
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:3001 \
  -t family-fi-web .
```

## Production Env Checklist

- Set `DATABASE_URL` to the production database connection string.
- Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN`, `HUB_ORIGIN`, and
  `VITE_API_BASE_URL` for the production origins.
- Set `IKI_OAUTH_CLIENT_SECRET` to the Iki OAuth client secret. Override
  `IKI_OAUTH_CLIENT_ID` only when it differs from `family-fi`.
- Set `IKI_AUTH_BROWSER_ORIGIN` and `IKI_AUTH_SERVER_ORIGIN` to the deployed Iki
  API origins, or set the explicit `IKI_OAUTH_*` endpoint URLs.
- Set `VITE_HUB_API_BASE_URL` so the web app can clear the Iki session on
  sign-out.
- Set `VITE_LOGIN_FALLBACK_URL` to the Iki Hub login URL with the source app
  context, used when account session checks cannot complete.

Docker-local variables:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`: local
  Postgres container provisioning.
- `API_PORT`, `WEB_HOST`, `WEB_PORT`: local container ports and host binding.
- `CHOKIDAR_USEPOLLING`: local file watching.

## Checks

```bash
bun run build
bun run check-types
```
