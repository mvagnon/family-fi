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

- `FAMILY_FI_API_ORIGIN`: API HTTP(S) origin used for the Iki OAuth callback,
  default `http://localhost:3001`.
- `WEB_ORIGIN`: credentialed CORS/trusted web HTTP(S) origin, default
  `http://localhost:5174`.
- `HUB_ORIGIN`: Iki hub HTTP(S) origin trusted for auth redirects, default
  `http://localhost:5173`.
- `IKI_OAUTH_DISCOVERY_URL`: preferred deployed Iki OIDC metadata HTTP(S) URL.
- `IKI_AUTH_BROWSER_ORIGIN`: Iki API HTTP(S) origin used for browser redirects,
  default `http://localhost:3000`.
- `IKI_AUTH_SERVER_ORIGIN`: Iki API HTTP(S) origin used by the API server for
  token and userinfo calls, default `IKI_AUTH_BROWSER_ORIGIN`.
- `IKI_OAUTH_AUTHORIZATION_URL`: explicit Iki OAuth authorization HTTP(S) URL.
- `IKI_OAUTH_ISSUER`: explicit Iki OAuth issuer, default
  `IKI_AUTH_BROWSER_ORIGIN` plus `/api/auth`.
- `IKI_OAUTH_TOKEN_URL`: explicit Iki OAuth token HTTP(S) URL.
- `IKI_OAUTH_USER_INFO_URL`: explicit Iki OAuth userinfo HTTP(S) URL.
- `IKI_OAUTH_CLIENT_ID`: Iki OAuth client ID, default `family-fi`.
- `IKI_OAUTH_CLIENT_SECRET`: Iki OAuth client secret. A dev default is used
  outside production.
- `OPENAPI_SERVER_URL`: server URL advertised in the generated OpenAPI spec,
  default request origin.

Production deployments must set `FAMILY_FI_API_ORIGIN`, `WEB_ORIGIN`,
`IKI_OAUTH_CLIENT_SECRET`, and the web build's
`VITE_API_BASE_URL` for the deployed origins. Prefer `IKI_OAUTH_DISCOVERY_URL`
for provider metadata. Override the Iki OAuth URLs only when discovery cannot
represent the browser/server network path.
Bare production hostnames are normalized to `https://`, but prefer setting the
full `https://...` origin in deployment variables.

The matching Iki OAuth client must be registered in Iki with callback URL
`http://localhost:3001/api/auth/oauth2/callback/iki` for local development, or
the equivalent deployed callback URL in production. Iki syncs that client from
its connected-app registry; this app's `IKI_OAUTH_CLIENT_SECRET` must match
Iki's `FAMILY_FI_OAUTH_CLIENT_SECRET`.

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
docker compose up --build api
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
  -e FAMILY_FI_API_ORIGIN="http://localhost:3001" \
  -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/family_fi" \
  -e IKI_OAUTH_CLIENT_SECRET="replace-with-iki-client-secret" \
  family-fi-api
```
