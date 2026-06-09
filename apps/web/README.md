# Web

React Router app for Family Fi.

## Local

```bash
bun run --filter=web dev
```

The app runs on `http://localhost:5174`.
`/auth/iki` starts the Iki OAuth flow, and protected app routes call
the same-origin `/api/*` proxy by default.

Set `FAMILY_FI_API_UPSTREAM_ORIGIN` to the real Family-Fi API origin used by
the server-side `/api/*` proxy, default `http://localhost:3001`.
Set `VITE_HUB_ORIGIN` to the Iki Hub origin used for account connection errors,
default `http://localhost:5173`.
Family-Fi adds `auth_error=1` when it redirects there after a failed account
connection attempt.
Bare production hostnames are normalized to `https://`; local and Railway
private hostnames are normalized to `http://`.

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
`FAMILY_FI_API_UPSTREAM_ORIGIN`. `VITE_HUB_ORIGIN` defaults to the local Iki Hub
URL when omitted.

The web source is bind-mounted into the container. Rebuild only when
dependencies change.

Build the production image from the repository root:

```bash
docker build \
  -f apps/web/Dockerfile \
  --build-arg VITE_HUB_ORIGIN=http://localhost:5173 \
  -t family-fi-web .

docker run --rm \
  -e FAMILY_FI_API_UPSTREAM_ORIGIN=http://host.docker.internal:3001 \
  -p 5174:5174 \
  family-fi-web
```
