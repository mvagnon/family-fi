import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";

import { UnauthenticatedError } from "./features/auth/domain/auth.js";
import type { AuthHttpAdapter } from "./features/auth/infrastructure/better-auth-provider.js";
import { FamilyService } from "./features/family/application/family-service.js";
import type { FamilyServiceOptions } from "./features/family/application/family-service.js";
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
  SpaceMemberAlreadyExistsError,
  SpaceMemberNotFoundError,
  SpaceOwnerRoleChangeError,
  SpaceUserNotFoundError,
} from "./features/spaces/domain/spaces.js";
import {
  createMeRouter,
  createSpacesRouter,
} from "./features/spaces/infrastructure/http/spaces-routes.js";
import {
  createOpenApiRouter,
  OPENAPI_JSON_PATH,
  SWAGGER_UI_PATH,
} from "./infrastructure/http/openapi.js";

interface CreateApiAppOptions {
  authProvider: AuthHttpAdapter;
  corsOrigin?: string;
  enableSwaggerUi?: boolean;
  familyRepository: FamilyRepository;
  familyServiceOptions?: FamilyServiceOptions;
  openApiServerUrl?: string;
  spaceRepository: SpaceRepository;
}

export function createApiApp({
  authProvider,
  corsOrigin = "http://localhost:5173",
  enableSwaggerUi = process.env.NODE_ENV !== "production",
  familyRepository,
  familyServiceOptions,
  openApiServerUrl,
  spaceRepository,
}: CreateApiAppOptions) {
  const app = createOpenApiRouter();
  const spacesService = new SpacesService(spaceRepository);
  const familyService = new FamilyService(
    familyRepository,
    spacesService,
    familyServiceOptions,
  );

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
    .doc(OPENAPI_JSON_PATH, (context) => ({
      info: {
        title: "Family-Fi API",
        version: "1.0.0",
      },
      openapi: "3.0.0",
      servers: [
        {
          url: openApiServerUrl ?? new URL(context.req.url).origin,
        },
      ],
    }))
    .get("/", (context) => {
      return context.text("Family-Fi API");
    })
    .on(["GET", "POST"], "/api/auth/*", (context) => {
      return authProvider.handleAuthRequest(context.req.raw);
    })
    .route("/api/spaces", createSpacesRouter(spacesService, authProvider))
    .route("/api/me", createMeRouter(spacesService, authProvider))
    .route(
      "/api/spaces/:spaceId/family",
      createFamilyRouter(familyService, authProvider),
    );

  if (enableSwaggerUi) {
    routes.get(
      SWAGGER_UI_PATH,
      swaggerUI({
        title: "Family-Fi API Docs",
        url: OPENAPI_JSON_PATH,
        withCredentials: true,
      }),
    );
  }

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

    if (
      error instanceof SpaceMemberAlreadyExistsError ||
      error instanceof SpaceOwnerRoleChangeError
    ) {
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

    if (
      error instanceof SpaceMemberNotFoundError ||
      error instanceof SpaceUserNotFoundError
    ) {
      return context.json({ message: error.message }, 404);
    }

    console.error(error);

    return context.json({ message: "Internal Server Error" }, 500);
  });

  return routes;
}

export type ApiAppType = ReturnType<typeof createApiApp>;
