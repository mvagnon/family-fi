# Family-Fi API

Hono API with Prisma, PostgreSQL, local sessions, and Iki OAuth login.

## Local

```bash
bun install
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run prisma:migrate
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" \
IKI_OAUTH_CLIENT_SECRET="replace-with-iki-client-secret" \
bun run dev
```

```bash
open http://localhost:3001
```

OpenAPI documentation:

- JSON spec: `http://localhost:3001/api/openapi.json`.
- Swagger UI: `http://localhost:3001/api/docs` when `NODE_ENV` is not
  `production`.

The API uses Prisma with PostgreSQL. `DATABASE_URL` is required at runtime.
Optional auth settings:

- `WEB_ORIGIN`: credentialed CORS/trusted web HTTP(S) origin, default
  `http://localhost:5174`. It is also the public origin used for the proxied
  Iki OAuth callback.
- `HUB_ORIGIN`: Iki hub HTTP(S) origin trusted for auth redirects, default
  `http://localhost:5173`.
- `IKI_AUTH_SERVER_ORIGIN`: optional Iki hub HTTP(S) origin used by the API to
  call Iki OAuth server endpoints, default `HUB_ORIGIN`. Set it to
  `http://host.docker.internal:3000` when the API runs in Docker and the Iki
  API runs on the host or in another local Docker stack.
- `IKI_OAUTH_CLIENT_ID`: Iki OAuth client ID, default `family-fi`.
- `IKI_OAUTH_CLIENT_SECRET`: Iki OAuth client secret. A dev default is used
  outside production.
- `OPENAPI_SERVER_URL`: server URL advertised in the generated OpenAPI spec,
  default request origin.

Production deployments must set `WEB_ORIGIN`, `HUB_ORIGIN`, and
`IKI_OAUTH_CLIENT_SECRET`. Iki provider metadata is discovered through
`HUB_ORIGIN` at `/api/auth/.well-known/openid-configuration`, so the Family-Fi
API does not need to know the real Iki API domain.
Bare production hostnames are normalized to `https://`; local and Railway
private hostnames are normalized to `http://`.

The matching Iki OAuth client must be registered in Iki with callback URL
`http://localhost:5174/api/auth/oauth2/callback/iki` for local development, or
the equivalent deployed web callback URL in production. Iki syncs that client
from its connected-app registry; this app's `IKI_OAUTH_CLIENT_SECRET` must
match Iki's `FAMILY_FI_OAUTH_CLIENT_SECRET`.

Family budget routes are scoped under `/api/spaces/:spaceId/family`.

## Auth Identity

Iki is the source of truth for account identity and profile data. Family-Fi
stores the Iki OIDC `sub` in `user.iki_user_id` and keeps local `email`/`name`
values as a cache refreshed through its Iki OAuth flow.

Family-Fi still uses its local `user.id` for internal relations such as space
memberships and settings. New personal space ids are derived from the Iki
`sub`, while existing owned spaces are preserved.

Space member autocomplete searches only users already known by Family-Fi. It
does not query a global Iki user directory.

## Architecture

Feature code under `src/features/*` follows a hexagonal split:

- `domain`: model, ports, and domain errors.
- `application`: use cases and business orchestration.
- `infrastructure`: HTTP and persistence adapters.
- `<layer>/tests`: feature-owned tests, colocated under the layer they verify.

## Docker

Run the dev stack with hot reload from the repository root:

```bash
bun run docker:up
```

Docker Compose reads local API, auth, and database values from the root `.env`.
`POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` provision the local
Postgres container. The API container receives a derived `DATABASE_URL` that
contains those credentials and points to the local `db` service.

The API source is bind-mounted into the container. Rebuild only when
dependencies change.

Build the production image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t family-fi-api .

docker run --rm \
  -p 3001:3001 \
  -e WEB_ORIGIN="http://localhost:5174" \
  -e HUB_ORIGIN="http://localhost:5173" \
  -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/family_fi" \
  -e IKI_OAUTH_CLIENT_SECRET="replace-with-iki-client-secret" \
  family-fi-api
```
