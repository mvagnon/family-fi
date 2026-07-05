import { serve } from "@hono/node-server";

import { createApiApp } from "./app.js";
import { createLogtoAuthProvider } from "./features/auth/infrastructure/logto-auth-provider.js";
import { PrismaFamilyRepository } from "./features/family/infrastructure/persistence/prisma-family-repository.js";
import { PrismaSpacesRepository } from "./features/spaces/infrastructure/persistence/prisma-spaces-repository.js";
import { prisma } from "./infrastructure/prisma.js";

const port = Number.parseInt(process.env.PORT ?? "3001", 10);
const webOrigin = getRequiredHttpOrigin("WEB_ORIGIN");
const logtoEndpoint = getRequiredHttpOrigin("LOGTO_ENDPOINT");
const logtoIssuer = getRequiredHttpUrl("LOGTO_ISSUER");
const openApiServerUrl = getOptionalHttpOrigin("OPENAPI_SERVER_URL");
const authProvider = createLogtoAuthProvider(prisma, {
  baseUrl: webOrigin,
  devUser: resolveDevUser(),
  logtoClientId: getRequiredEnv("LOGTO_CLIENT_ID"),
  logtoClientSecret: getRequiredEnv("LOGTO_CLIENT_SECRET"),
  logtoDiscoveryUrl: new URL(
    "/oidc/.well-known/openid-configuration",
    logtoEndpoint,
  ).toString(),
  logtoIssuer,
  postSignOutRedirectUrl: new URL("/auth/signed-out", webOrigin).toString(),
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

function resolveDevUser(): { email: string; name: string } | undefined {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  const email = getOptionalEnv("AUTH_DEV_USER_EMAIL");

  if (!email) {
    return undefined;
  }

  return {
    email,
    name: getOptionalEnv("AUTH_DEV_USER_NAME") ?? "Dev Tester",
  };
}

function getRequiredEnv(name: string): string {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`${name} is required to start the API.`);
  }

  return value;
}

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

function getOptionalHttpOrigin(name: string): string | undefined {
  const value = getOptionalEnv(name);

  return value ? new URL(normalizeHttpUrl(value)).origin : undefined;
}

function getRequiredHttpOrigin(name: string): string {
  return new URL(normalizeHttpUrl(getRequiredEnv(name))).origin;
}

function getRequiredHttpUrl(name: string): string {
  return normalizeHttpUrl(getRequiredEnv(name));
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
