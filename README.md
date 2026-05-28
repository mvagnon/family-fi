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

Run only one side:

```bash
bun run dev:api
bun run dev:client
```

## Docker

Run the full stack with PostgreSQL, Prisma migrations, API, and web:

```bash
docker compose up --build
```

Then open `http://localhost:5173/family`.

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

## Checks

```bash
bun run build
bun run check-types
```
