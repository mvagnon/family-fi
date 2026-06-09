import { serve } from "@hono/node-server";

import { createApiApp } from "./app.js";
import { createBetterAuthProvider } from "./features/auth/infrastructure/better-auth-provider.js";
import { PrismaFamilyRepository } from "./features/family/infrastructure/persistence/prisma-family-repository.js";
import { PrismaSpacesRepository } from "./features/spaces/infrastructure/persistence/prisma-spaces-repository.js";
import { prisma } from "./infrastructure/prisma.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5174";
const hubOrigin = process.env.HUB_ORIGIN ?? "http://localhost:5173";
const ikiAuthBrowserOrigin =
  process.env.IKI_AUTH_BROWSER_ORIGIN ?? "http://localhost:3000";
const ikiAuthServerOrigin =
  process.env.IKI_AUTH_SERVER_ORIGIN ?? ikiAuthBrowserOrigin;
const ikiOAuthDiscoveryUrl = getOptionalEnv("IKI_OAUTH_DISCOVERY_URL");
const openApiServerUrl = process.env.OPENAPI_SERVER_URL;
const authProvider = createBetterAuthProvider(prisma, {
  baseUrl: process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`,
  hubOrigin,
  ikiOAuthClientId: process.env.IKI_OAUTH_CLIENT_ID ?? "family-fi",
  ikiOAuthClientSecret: getIkiOAuthClientSecret(),
  ikiOAuthDiscoveryUrl,
  ikiOAuthAuthorizationUrl: ikiOAuthDiscoveryUrl
    ? undefined
    : (process.env.IKI_OAUTH_AUTHORIZATION_URL ??
      `${ikiAuthBrowserOrigin}/api/auth/oauth2/authorize`),
  ikiOAuthIssuer: ikiOAuthDiscoveryUrl
    ? undefined
    : (process.env.IKI_OAUTH_ISSUER ?? `${ikiAuthBrowserOrigin}/api/auth`),
  ikiOAuthTokenUrl: ikiOAuthDiscoveryUrl
    ? undefined
    : (process.env.IKI_OAUTH_TOKEN_URL ??
      `${ikiAuthServerOrigin}/api/auth/oauth2/token`),
  ikiOAuthUserInfoUrl: ikiOAuthDiscoveryUrl
    ? undefined
    : (process.env.IKI_OAUTH_USER_INFO_URL ??
      `${ikiAuthServerOrigin}/api/auth/oauth2/userinfo`),
  secret: getBetterAuthSecret(),
  trustedOrigins: [webOrigin],
});

const app = createApiApp({
  authProvider,
  corsOrigin: webOrigin,
  familyRepository: new PrismaFamilyRepository(prisma),
  openApiServerUrl,
  spaceRepository: new PrismaSpacesRepository(prisma),
});

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);

function getBetterAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is required to start the API.");
  }

  return secret;
}

function getIkiOAuthClientSecret(): string {
  const secret = process.env.IKI_OAUTH_CLIENT_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("IKI_OAUTH_CLIENT_SECRET is required to start the API.");
  }

  return secret ?? "development-only-family-fi-oauth-secret";
}

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}
