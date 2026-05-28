# Web

React Router app for Family Fi.

## Local

```bash
bun run --filter=web dev
```

The app runs on `http://localhost:5173`.
`/family` calls `http://localhost:3000` by default.

Override the API URL at build time with `VITE_API_BASE_URL`.

## Frontend architecture

Feature code under `app/features/*` follows a hexagonal split:

- `domain`: pure model and business calculations.
- `application`: ports and framework-free commands.
- `infrastructure`: adapters such as HTTP and DTO parsing.
- `presentation`: React components, formatting, and frontend hooks.
- `<layer>/tests`: feature-owned tests, colocated under the layer they verify.

Routes compose infrastructure adapters with presentation entry points.

## Docker

Run from the repository root:

```bash
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:3000 \
  -t family-fi-web .

docker run --rm -p 5173:5173 family-fi-web
```
