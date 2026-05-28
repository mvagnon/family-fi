import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import { FamilyService } from "./features/family/application/family-service.js";
import {
  InvalidFamilyInputError,
  RecurringLineNotFoundError,
} from "./features/family/domain/family.js";
import type { FamilyRepository } from "./features/family/domain/family-repository.js";
import { createFamilyRouter } from "./features/family/infrastructure/http/family-routes.js";

interface CreateApiAppOptions {
  familyRepository: FamilyRepository;
}

export function createApiApp({ familyRepository }: CreateApiAppOptions) {
  const app = new Hono();
  const familyService = new FamilyService(familyRepository);

  app.use("/api/*", cors());

  const routes = app
    .get("/", (context) => {
      return context.text("Family-Fi API");
    })
    .route("/api/family", createFamilyRouter(familyService));

  routes.notFound((context) => {
    return context.json({ message: "Not Found" }, 404);
  });

  routes.onError((error, context) => {
    if (error instanceof InvalidFamilyInputError) {
      return context.json({ message: error.message }, 400);
    }

    if (error instanceof HTTPException && error.status === 400) {
      const message =
        error.message === "Malformed JSON in request body"
          ? "Request body must be a JSON object."
          : error.message;

      return context.json({ message }, 400);
    }

    if (error instanceof RecurringLineNotFoundError) {
      return context.json({ message: error.message }, 404);
    }

    console.error(error);

    return context.json({ message: "Internal Server Error" }, 500);
  });

  return routes;
}

export type ApiAppType = ReturnType<typeof createApiApp>;
