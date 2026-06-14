# family-fi

Turborepo Bun workspace with:

- `apps/web`: React Router app
- `apps/api`: Hono API with Prisma, PostgreSQL, local sessions, and Logto OIDC login

## Local

Start Logto from `../iki` first:

```bash
cd ../iki
bun install
bun run dev
```

Logto runs on `http://localhost:3010`.
The Logto Admin Console runs on `http://localhost:3011/console`.

In the Logto Admin Console, create a traditional web application for Family-Fi
and register this redirect URI:

```text
http://localhost:5174/api/auth/callback/logto
```

Register this post sign-out redirect URI too:

```text
http://localhost:5174/auth/signed-out
```

Then create a root `.env` for local Docker development:

```env
POSTGRES_DB=family_fi
POSTGRES_USER=family_fi
POSTGRES_PASSWORD=family_fi
POSTGRES_PORT=5432
CHOKIDAR_USEPOLLING=true
API_PORT=3001
FAMILY_FI_API_UPSTREAM_ORIGIN=http://localhost:3001
LOGTO_ENDPOINT=http://host.docker.internal:3010
LOGTO_ISSUER=http://localhost:3010/oidc
LOGTO_CLIENT_ID=replace-with-logto-app-id
LOGTO_CLIENT_SECRET=replace-with-logto-app-secret
WEB_ORIGIN=http://localhost:5174
WEB_HOST=0.0.0.0
WEB_PORT=5174
```

Then start the API and frontend:

```bash
bun install
bun run dev
```

The web app runs on `http://localhost:5174`.
The API runs from Docker on `http://localhost:3001`.

Run one package from its app directory when needed:

```bash
cd apps/api && bun run dev
cd apps/web && bun run dev
```

When starting the API outside Docker, set `DATABASE_URL`, `WEB_ORIGIN`,
`LOGTO_ENDPOINT`, `LOGTO_ISSUER`, `LOGTO_CLIENT_ID`, and
`LOGTO_CLIENT_SECRET` in the shell or API environment.

## Docker

Run the Docker development stack for PostgreSQL, Prisma migrations, and the API:

```bash
bun run docker:up
```

Docker Compose reads `.env` for local configuration and injects it into the API
container. `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` provision the
local Postgres container. The API container receives a derived `DATABASE_URL`
that contains those credentials and points to the local `db` service.

In production, do not use the Compose-only variables unless you also provision
Postgres yourself with Compose. Set the deployed `DATABASE_URL` from the
database provider instead; that URL already contains the database user,
password, host, port, and database name.

Run the web app with Bun for normal frontend work:

```bash
bun run dev:web
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
bun run docker:up
```

Build one image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t family-fi-api .
docker build -f apps/web/Dockerfile -t family-fi-web .
```

## Production Env Checklist

- Set `DATABASE_URL` to the production database connection string.
- Set `WEB_ORIGIN` on the API to the public Family-Fi web origin.
- Set `LOGTO_ENDPOINT` on the API to the public Logto endpoint.
- Set `LOGTO_ISSUER` on the API to the Logto OIDC issuer.
- Set `LOGTO_CLIENT_ID` and `LOGTO_CLIENT_SECRET` on the API from the Logto
  Family-Fi application.
- Set `FAMILY_FI_API_UPSTREAM_ORIGIN` on the web service to the real API
  domain.
- Register the Logto redirect URI as
  `WEB_ORIGIN/api/auth/callback/logto`.
- Register the Logto post sign-out redirect URI as
  `WEB_ORIGIN/auth/signed-out`.

For local Docker, `LOGTO_ENDPOINT` can point to
`http://host.docker.internal:3010` so the API container can reach Logto, while
`LOGTO_ISSUER` remains the public issuer exposed by Logto, such as
`http://localhost:3010/oidc`.

Docker-local variables:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`: local
  Postgres container provisioning.
- `API_PORT`, `WEB_HOST`, `WEB_PORT`: local container ports and host binding.
- `CHOKIDAR_USEPOLLING`: local file watching.

## Checks

```bash
bun run build
bun run check-types
bun run lint
```
