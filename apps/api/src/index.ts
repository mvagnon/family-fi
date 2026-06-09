import { serve } from "@hono/node-server";

import { createApiApp } from "./app.js";
import { createOAuthAuthProvider } from "./features/auth/infrastructure/oauth-auth-provider.js";
import { PrismaFamilyRepository } from "./features/family/infrastructure/persistence/prisma-family-repository.js";
import { PrismaSpacesRepository } from "./features/spaces/infrastructure/persistence/prisma-spaces-repository.js";
import { prisma } from "./infrastructure/prisma.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const webOrigin =
  getOptionalHttpOrigin("WEB_ORIGIN") ?? "http://localhost:5174";
const hubOrigin =
  getOptionalHttpOrigin("HUB_ORIGIN") ?? "http://localhost:5173";
const ikiAuthServerOrigin =
  getOptionalHttpOrigin("IKI_AUTH_SERVER_ORIGIN") ?? hubOrigin;
const openApiServerUrl = getOptionalHttpOrigin("OPENAPI_SERVER_URL");
const authProvider = createOAuthAuthProvider(prisma, {
  baseUrl: webOrigin,
  hubOrigin,
  ikiOAuthClientId: process.env.IKI_OAUTH_CLIENT_ID ?? "family-fi",
  ikiOAuthClientSecret: getIkiOAuthClientSecret(),
  ikiOAuthDiscoveryUrl: `${ikiAuthServerOrigin}/api/auth/.well-known/openid-configuration`,
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

function getOptionalHttpOrigin(name: string): string | undefined {
  const value = getOptionalEnv(name);

  return value ? new URL(normalizeHttpUrl(value)).origin : undefined;
}

function normalizeHttpUrl(value: string): string {
  const normalizedValue = value.trim().replace(/\/+$/, "");
  const url = /^https?:\/\//i.test(normalizedValue)
    ? normalizedValue
    : `${getDefaultProtocol(normalizedValue)}://${normalizedValue}`;

  new URL(url);

  return url;
}

function getDefaultProtocol(value: string): "http" | "https" {
  const host = value.split(/[/?#]/, 1)[0]?.toLowerCase() ?? "";

  if (
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host === "127.0.0.1" ||
    host.startsWith("127.0.0.1:") ||
    host === "[::1]" ||
    host.startsWith("[::1]:") ||
    host.endsWith(".railway.internal") ||
    host.includes(".railway.internal:")
  ) {
    return "http";
  }

  return "https";
}
