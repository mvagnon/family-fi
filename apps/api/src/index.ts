import { serve } from "@hono/node-server";

import { createApiApp } from "./app.js";
import { createBetterAuthProvider } from "./features/auth/infrastructure/better-auth-provider.js";
import { PrismaFamilyRepository } from "./features/family/infrastructure/persistence/prisma-family-repository.js";
import { PrismaSpacesRepository } from "./features/spaces/infrastructure/persistence/prisma-spaces-repository.js";
import { seedDevData } from "./infrastructure/dev-seed.js";
import { prisma } from "./infrastructure/prisma.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:5173";
const openApiServerUrl = process.env.OPENAPI_SERVER_URL;
const authProvider = createBetterAuthProvider(prisma, {
  baseUrl: process.env.BETTER_AUTH_URL ?? `http://localhost:${port}`,
  secret: getBetterAuthSecret(),
  trustedOrigins: [webOrigin],
});

assertDevSeedIsAllowed();

if (process.env.ENABLE_DEV_SEED === "true") {
  await seedDevData(prisma);
}

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

function assertDevSeedIsAllowed(): void {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEV_SEED === "true"
  ) {
    throw new Error(
      "ENABLE_DEV_SEED=true is forbidden when NODE_ENV=production.",
    );
  }
}
