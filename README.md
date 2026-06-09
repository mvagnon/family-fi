# family-fi

Turborepo Bun workspace with:

- `apps/web`: React Router app
- `apps/api`: Hono API with Prisma and PostgreSQL

## Local

```bash
bun install
bun run dev
```

The web app runs on `http://localhost:5174`.
The API runs on `http://localhost:3001`.
Run `../iki` on API `http://localhost:3000` and hub
`http://localhost:5173` before signing in.
Set `BETTER_AUTH_SECRET` to a 32+ character value before starting the API
outside Docker.

Run one package from its app directory when needed:

```bash
cd apps/api && bun run dev
cd apps/web && bun run dev
```

## Docker

Run the development stack with PostgreSQL, Prisma migrations, API, web, and
bind-mounted source files:

```bash
cp .env.example .env
docker compose up --build
```

Docker Compose reads `.env` for local configuration. Keep `.env` uncommitted
and update it when local ports, origins, or development secrets differ from the
example values.

Run `../iki` on API `http://localhost:3000` and hub
`http://localhost:5173`, then open Iki Hub and launch Family-Fi from there.
Changes in `apps/web`, `apps/api`, and shared packages are mounted into the
containers and reload without rebuilding the images.

If dependencies or the local Prisma migration history change, recreate the
Docker volumes:

```bash
docker compose down -v
docker compose up --build
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

- Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN`, and
  `VITE_API_BASE_URL` for the production origins.
- Set `IKI_OAUTH_CLIENT_ID`, `IKI_OAUTH_CLIENT_SECRET`, and
  the Iki OAuth endpoint URLs to the Iki OAuth client values.
- Set `VITE_HUB_API_BASE_URL` so the web app can clear the Iki session on
  sign-out.
- Set `VITE_LOGIN_FALLBACK_URL` to the Iki Hub login URL with the source app
  context, used when account session checks cannot complete.

## Checks

```bash
bun run build
bun run check-types
```
