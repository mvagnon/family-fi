# Web

React Router app for Family Fi.

## Local

```bash
bun run --filter=web dev
```

The app runs on `http://localhost:5174`.
`/login` and protected app routes call `http://localhost:3001` by default.

Override the API URL at build time with `VITE_API_BASE_URL`.
Set `VITE_HUB_API_BASE_URL` to the Iki API origin, default
`http://localhost:3000`.
Set `VITE_LOGIN_FALLBACK_URL` to the URL opened from the account connection
error state.

## Frontend architecture

Feature code under `app/features/*` follows a hexagonal split:

- `domain`: pure model and business calculations.
- `application`: ports and framework-free commands.
- `infrastructure`: adapters such as HTTP and DTO parsing.
- `presentation`: React components, formatting, and frontend hooks.
- `<layer>/tests`: feature-owned tests, colocated under the layer they verify.

Routes compose infrastructure adapters with presentation entry points.

## Docker

Run the dev stack with hot reload from the repository root:

```bash
docker compose up --build web
```

The web source is bind-mounted into the container. Rebuild only when
dependencies change.

Build the production image from the repository root:

```bash
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:3001 \
  --build-arg VITE_LOGIN_FALLBACK_URL=http://localhost:5174/login \
  -t family-fi-web .

docker run --rm -p 5174:5174 family-fi-web
```
