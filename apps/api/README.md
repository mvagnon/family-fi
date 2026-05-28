```bash
bun install
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run prisma:migrate
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run dev
```

```bash
open http://localhost:3000
```

The API uses Prisma with PostgreSQL. `DATABASE_URL` is required at runtime.

## Architecture

Feature code under `src/features/*` follows a hexagonal split:

- `domain`: model, ports, and domain errors.
- `application`: use cases and business orchestration.
- `infrastructure`: HTTP and persistence adapters.
- `<layer>/tests`: feature-owned tests, colocated under the layer they verify.

## Docker

Run from the repository root:

```bash
docker build -f apps/api/Dockerfile -t family-fi-api .

docker run --rm \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/family_fi" \
  family-fi-api
```
