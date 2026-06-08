# family-fi

Turborepo Bun workspace with:

- `apps/web`: React Router app
- `apps/api`: Hono API with Prisma and PostgreSQL

## Local

```bash
bun install
bun run dev
```

The web app runs on `http://localhost:5173`.
The API runs on `http://localhost:3000`.
Set `BETTER_AUTH_SECRET` to a 32+ character value before starting the API
outside Docker.

Run only one side:

```bash
bun run dev:api
bun run dev:client
```

## Docker

Run the development stack with PostgreSQL, Prisma migrations, API, web, and
bind-mounted source files:

```bash
docker compose up --build
```

Then open `http://localhost:5173/login` and sign in with the development user
`test@test.com` / `Test2026!`.
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
  --build-arg VITE_API_BASE_URL=http://localhost:3000 \
  -t family-fi-web .
```

## Production Env Checklist

- Set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN`, and
  `VITE_API_BASE_URL` for the production origins.
- Do not set `ENABLE_DEV_SEED=true` in production. The API refuses to start when
  `NODE_ENV=production` and dev seed is enabled.

## Checks

```bash
bun run build
bun run check-types
```
