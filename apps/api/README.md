# Family-Fi API

Hono API with Prisma, PostgreSQL, local sessions, and Logto OIDC login.

## Local

```bash
bun install
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run prisma:migrate
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" \
WEB_ORIGIN="http://localhost:5174" \
LOGTO_ENDPOINT="http://localhost:3010" \
LOGTO_ISSUER="http://localhost:3010/oidc" \
LOGTO_CLIENT_ID="replace-with-logto-app-id" \
LOGTO_CLIENT_SECRET="replace-with-logto-app-secret" \
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

Auth settings:

- `WEB_ORIGIN`: credentialed CORS/trusted web HTTP(S) origin. It is also the
  public origin used for the proxied Logto callback.
- `LOGTO_ENDPOINT`: Logto HTTP(S) origin used to load OIDC discovery.
- `LOGTO_ISSUER`: Logto OIDC issuer expected in discovery.
- `LOGTO_CLIENT_ID`: Family-Fi application ID from Logto.
- `LOGTO_CLIENT_SECRET`: Family-Fi application secret from Logto.
- `OPENAPI_SERVER_URL`: server URL advertised in the generated OpenAPI spec,
  default request origin.
- `AUTH_DEV_USER_EMAIL`: local-only bypass. When set (and `NODE_ENV` is not
  `production`), `/api/auth/login` signs in as this test user without contacting
  Logto, so Family-Fi runs without the Iki auth server. Unset it to use real
  Logto.
- `AUTH_DEV_USER_NAME`: display name for the bypass test user, default
  `Dev Tester`.

Production deployments must set `WEB_ORIGIN`, `LOGTO_ENDPOINT`,
`LOGTO_ISSUER`, `LOGTO_CLIENT_ID`, and `LOGTO_CLIENT_SECRET`. Logto provider
metadata is discovered at `LOGTO_ENDPOINT/oidc/.well-known/openid-configuration`
and its `issuer` must match `LOGTO_ISSUER`.
Bare production hostnames are normalized to `https://`; local and Railway
private hostnames are normalized to `http://`.

For local Docker, `LOGTO_ENDPOINT` can point to
`http://host.docker.internal:3010` so the API container can reach Logto, while
`LOGTO_ISSUER` remains the public issuer exposed by Logto, such as
`http://localhost:3010/oidc`.

The matching Logto application must register this callback URL for local
development:

```text
http://localhost:5174/api/auth/callback/logto
```

It must also register this post sign-out redirect URL:

```text
http://localhost:5174/auth/signed-out
```

Use the equivalent deployed web callback and post sign-out URLs in production.

Family budget routes are scoped under `/api/spaces/:spaceId/family`.

## Auth Identity

Logto is the source of truth for account identity and profile data. Family-Fi
stores the Logto OIDC `sub` in `user.identity_subject` and keeps local
`email`/`name` values as a cache refreshed through its Logto OIDC flow.

Family-Fi still uses its local `user.id` for internal relations such as space
memberships and settings. New personal space ids are derived from the Logto
`sub`, while existing owned spaces are preserved.

Space member autocomplete searches only users already known by Family-Fi. It
does not query a global Logto user directory.

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
  -e LOGTO_ENDPOINT="http://host.docker.internal:3010" \
  -e LOGTO_ISSUER="http://localhost:3010/oidc" \
  -e LOGTO_CLIENT_ID="replace-with-logto-app-id" \
  -e LOGTO_CLIENT_SECRET="replace-with-logto-app-secret" \
  -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/family_fi" \
  family-fi-api
```
