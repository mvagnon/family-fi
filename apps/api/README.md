```bash
bun install
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" bun run prisma:migrate
DATABASE_URL="postgresql://user:password@localhost:5432/family_fi" \
BETTER_AUTH_SECRET="replace-with-a-32-character-secret" \
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

The API uses Prisma with PostgreSQL. `DATABASE_URL` and
`BETTER_AUTH_SECRET` are required at runtime. Optional auth settings:

- `BETTER_AUTH_URL`: API origin used by Better Auth, default `http://localhost:3001`.
- `WEB_ORIGIN`: credentialed CORS/trusted web origin, default `http://localhost:5174`.
- `HUB_ORIGIN`: Iki hub origin trusted for auth redirects, default `http://localhost:5173`.
- `IKI_AUTH_BROWSER_ORIGIN`: Iki API origin used for browser redirects, default
  `http://localhost:3000`.
- `IKI_AUTH_SERVER_ORIGIN`: Iki API origin used by the API server for token and
  userinfo calls, default `IKI_AUTH_BROWSER_ORIGIN`.
- `IKI_OAUTH_AUTHORIZATION_URL`: explicit Iki OAuth authorization URL.
- `IKI_OAUTH_ISSUER`: explicit Iki OAuth issuer, default
  `IKI_AUTH_BROWSER_ORIGIN` plus `/api/auth`.
- `IKI_OAUTH_TOKEN_URL`: explicit Iki OAuth token URL.
- `IKI_OAUTH_USER_INFO_URL`: explicit Iki OAuth userinfo URL.
- `IKI_OAUTH_CLIENT_ID`: Iki OAuth client ID, default `family-fi`.
- `IKI_OAUTH_CLIENT_SECRET`: Iki OAuth client secret. A dev default is used
  outside production.
- `OPENAPI_SERVER_URL`: server URL advertised in the generated OpenAPI spec,
  default request origin.

Production deployments must set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`,
`WEB_ORIGIN`, `IKI_OAUTH_CLIENT_SECRET`, the Iki OAuth URLs, and the web build's
`VITE_API_BASE_URL` for the deployed origins.

Family budget routes are scoped under `/api/spaces/:spaceId/family`.

## Auth Identity

Iki is the source of truth for account identity and profile data. Family-Fi
stores the Iki OIDC `sub` in `user.iki_user_id` and keeps local `email`/`name`
values as a cache refreshed through Better Auth's Iki OAuth flow.

Family-Fi still uses its local Better Auth `user.id` for internal relations
such as space memberships and settings. New personal space ids are derived from
the Iki `sub`, while existing owned spaces are preserved.

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
cp .env.example .env
docker compose up --build api
```

Docker Compose reads local API, auth, and database values from `.env`.

The API source is bind-mounted into the container. Rebuild only when
dependencies change.

Build the production image from the repository root:

```bash
docker build -f apps/api/Dockerfile -t family-fi-api .

docker run --rm \
  -p 3001:3001 \
  -e BETTER_AUTH_SECRET="replace-with-a-32-character-secret" \
  -e DATABASE_URL="postgresql://user:password@host.docker.internal:5432/family_fi" \
  -e IKI_OAUTH_CLIENT_SECRET="replace-with-iki-client-secret" \
  family-fi-api
```
