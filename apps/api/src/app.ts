import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import type { AuthProvider } from "./features/auth/domain/auth.js";
import { UnauthenticatedError } from "./features/auth/domain/auth.js";
import { FamilyService } from "./features/family/application/family-service.js";
import {
  FamilyEntityNotFoundError,
  InvalidFamilyInputError,
} from "./features/family/domain/family.js";
import type { FamilyRepository } from "./features/family/domain/family-repository.js";
import { createFamilyRouter } from "./features/family/infrastructure/http/family-routes.js";
import { SpacesService } from "./features/spaces/application/spaces-service.js";
import type { SpaceRepository } from "./features/spaces/domain/space-repository.js";
import {
  InvalidSpaceInputError,
  SpaceAccessDeniedError,
} from "./features/spaces/domain/spaces.js";
import {
  createMeRouter,
  createSpacesRouter,
} from "./features/spaces/infrastructure/http/spaces-routes.js";

interface CreateApiAppOptions {
  authProvider: AuthProvider;
  corsOrigin?: string;
  familyRepository: FamilyRepository;
  spaceRepository: SpaceRepository;
}

export function createApiApp({
  authProvider,
  corsOrigin = "http://localhost:5173",
  familyRepository,
  spaceRepository,
}: CreateApiAppOptions) {
  const app = new Hono();
  const spacesService = new SpacesService(spaceRepository);
  const familyService = new FamilyService(familyRepository, spacesService);

  app.use(
    "/api/*",
    cors({
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      origin: corsOrigin,
    }),
  );

  const routes = app
    .get("/", (context) => {
      return context.text("Family-Fi API");
    })
    .on(["GET", "POST"], "/api/auth/*", (context) => {
      return authProvider.handleRequest(context.req.raw);
    })
    .route("/api/spaces", createSpacesRouter(spacesService, authProvider))
    .route("/api/me", createMeRouter(spacesService, authProvider))
    .route(
      "/api/spaces/:spaceId/family",
      createFamilyRouter(familyService, authProvider),
    );

  routes.notFound((context) => {
    return context.json({ message: "Not Found" }, 404);
  });

  routes.onError((error, context) => {
    if (error instanceof InvalidFamilyInputError) {
      return context.json({ message: error.message }, 400);
    }

    if (error instanceof InvalidSpaceInputError) {
      return context.json({ message: error.message }, 400);
    }

    if (error instanceof UnauthenticatedError) {
      return context.json({ message: error.message }, 401);
    }

    if (error instanceof SpaceAccessDeniedError) {
      return context.json({ message: error.message }, 403);
    }

    if (error instanceof HTTPException && error.status === 400) {
      const message =
        error.message === "Malformed JSON in request body"
          ? "Request body must be a JSON object."
          : error.message;

      return context.json({ message }, 400);
    }

    if (error instanceof FamilyEntityNotFoundError) {
      return context.json({ message: error.message }, 404);
    }

    console.error(error);

    return context.json({ message: "Internal Server Error" }, 500);
  });

  return routes;
}

export type ApiAppType = ReturnType<typeof createApiApp>;
