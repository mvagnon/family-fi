import { createRoute, z } from "@hono/zod-openapi";

import {
  getAuthenticatedUser,
  type AuthSessionReader,
} from "../../../auth/infrastructure/http/current-user.js";
import {
  createOpenApiRouter,
  errorResponseSchema,
  jsonResponse,
} from "../../../../infrastructure/http/openapi.js";
import type { SpacesService } from "../../application/spaces-service.js";
import {
  spaceSummarySchema,
  updateDefaultSpaceInputSchema,
  updateSpaceCurrencyInputSchema,
  userSettingsSchema,
} from "../../domain/spaces.js";

const pathIdSchema = (name: string, example: string) =>
  z
    .string()
    .min(1)
    .openapi({
      example,
      param: {
        in: "path",
        name,
      },
    });

const spaceRouteParamsSchema = z.object({
  spaceId: pathIdSchema("spaceId", "test-space"),
});

const spacesJsonResponse = jsonResponse(
  "Spaces accessible to the current user.",
  z.array(spaceSummarySchema),
);
const spaceJsonResponse = jsonResponse("Space settings.", spaceSummarySchema);
const userSettingsJsonResponse = jsonResponse(
  "Current user settings.",
  userSettingsSchema,
);
const validationErrorResponse = jsonResponse(
  "Request validation failed.",
  errorResponseSchema,
);
const unauthenticatedResponse = jsonResponse(
  "Authentication is required.",
  errorResponseSchema,
);
const accessDeniedResponse = jsonResponse(
  "Space is not accessible.",
  errorResponseSchema,
);

const listSpacesRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: spacesJsonResponse,
    401: unauthenticatedResponse,
  },
});

const getUserSettingsRoute = createRoute({
  method: "get",
  path: "/settings",
  responses: {
    200: userSettingsJsonResponse,
    401: unauthenticatedResponse,
  },
});

const updateDefaultSpaceRoute = createRoute({
  method: "put",
  path: "/settings/default-space",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateDefaultSpaceInputSchema,
        },
      },
    },
  },
  responses: {
    200: userSettingsJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const updateSpaceCurrencyRoute = createRoute({
  method: "put",
  path: "/{spaceId}/settings/currency",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateSpaceCurrencyInputSchema,
        },
      },
    },
    params: spaceRouteParamsSchema,
  },
  responses: {
    200: spaceJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

export function createSpacesRouter(
  service: SpacesService,
  authProvider: AuthSessionReader,
) {
  return createOpenApiRouter()
    .openapi(listSpacesRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);

      return context.json(await service.listSpacesForUser(user.id), 200);
    })
    .openapi(updateSpaceCurrencyRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);
      const { spaceId } = context.req.valid("param");
      const space = await service.updateSpaceCurrency(
        user.id,
        spaceId,
        context.req.valid("json"),
      );

      return context.json(space, 200);
    });
}

export function createMeRouter(
  service: SpacesService,
  authProvider: AuthSessionReader,
) {
  return createOpenApiRouter()
    .openapi(getUserSettingsRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);

      return context.json(await service.getUserSettings(user.id), 200);
    })
    .openapi(updateDefaultSpaceRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);
      const settings = await service.updateDefaultSpace(
        user.id,
        context.req.valid("json"),
      );

      return context.json(settings, 200);
    });
}
