import { serve } from "@hono/node-server";

import { createApiApp } from "./app.js";
import { PrismaFamilyRepository } from "./features/family/infrastructure/persistence/prisma-family-repository.js";
import { prisma } from "./infrastructure/prisma.js";

const app = createApiApp({
  familyRepository: new PrismaFamilyRepository(prisma),
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
