# Web

React Router app for Family Fi.

## Local

```bash
bun run --filter=web dev
```

The app runs on `http://localhost:5174`.
`/auth/iki` starts the Iki OAuth flow, and protected app routes call
`http://localhost:3001` by default.

Override the API URL at build time with `VITE_API_BASE_URL`.
Set `VITE_HUB_API_BASE_URL` to the Iki API origin, default
`http://localhost:3000`.
Set `VITE_LOGIN_FALLBACK_URL` to the Iki Hub login URL opened from the account
connection error state, default `http://localhost:5173/login?app=family-fi`.
Family-Fi adds `auth_error=1` when it redirects there after a failed account
connection attempt.

## Frontend architecture

Feature code under `app/features/*` follows a hexagonal split:

- `domain`: pure model and business calculations.
- `application`: ports and framework-free commands.
- `infrastructure`: adapters such as HTTP and DTO parsing.
- `presentation`: React components, formatting, and frontend hooks.
- `<layer>/tests`: feature-owned tests, colocated under the layer they verify.

Routes compose infrastructure adapters with presentation entry points.

## Docker

Run the web app with Bun during normal development:

```bash
bun run --filter=web dev
```

The Docker web service is available behind the `full` profile when you need a
containerized frontend:

```bash
docker compose --profile full up --build web
```

Docker Compose reads local web and API URL values from the root `.env`.
Required local values for this service are `WEB_HOST`, `WEB_PORT`, and
`VITE_API_BASE_URL`. `VITE_HUB_API_BASE_URL` and `VITE_LOGIN_FALLBACK_URL`
default to the local Iki URLs when omitted.

The web source is bind-mounted into the container. Rebuild only when
dependencies change.

Build the production image from the repository root:

```bash
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:3001 \
  --build-arg VITE_HUB_API_BASE_URL=http://localhost:3000 \
  --build-arg "VITE_LOGIN_FALLBACK_URL=http://localhost:5173/login?app=family-fi" \
  -t family-fi-web .

docker run --rm -p 5174:5174 family-fi-web
```
