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
  addSpaceMemberInputSchema,
  searchSpaceUsersQuerySchema,
  spaceMemberSchema,
  spaceSummarySchema,
  spaceUserSearchResultSchema,
  updateDefaultSpaceInputSchema,
  updateSpaceMemberInputSchema,
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

const spaceMemberRouteParamsSchema = spaceRouteParamsSchema.extend({
  userId: pathIdSchema("userId", "user-1"),
});

const spacesJsonResponse = jsonResponse(
  "Spaces accessible to the current user.",
  z.array(spaceSummarySchema),
);
const spaceJsonResponse = jsonResponse("Space settings.", spaceSummarySchema);
const spaceMembersJsonResponse = jsonResponse(
  "Space members.",
  z.array(spaceMemberSchema),
);
const spaceMemberJsonResponse = jsonResponse(
  "Space member.",
  spaceMemberSchema,
);
const spaceUserSearchJsonResponse = jsonResponse(
  "Existing users matching the search query.",
  z.array(spaceUserSearchResultSchema),
);
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
const notFoundResponse = jsonResponse(
  "Space user or member was not found.",
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

const listSpaceMembersRoute = createRoute({
  method: "get",
  path: "/{spaceId}/members",
  request: {
    params: spaceRouteParamsSchema,
  },
  responses: {
    200: spaceMembersJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const searchSpaceUsersRoute = createRoute({
  method: "get",
  path: "/{spaceId}/users/search",
  request: {
    params: spaceRouteParamsSchema,
    query: searchSpaceUsersQuerySchema,
  },
  responses: {
    200: spaceUserSearchJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const addSpaceMemberRoute = createRoute({
  method: "post",
  path: "/{spaceId}/members",
  request: {
    body: {
      content: {
        "application/json": {
          schema: addSpaceMemberInputSchema,
        },
      },
    },
    params: spaceRouteParamsSchema,
  },
  responses: {
    201: spaceMemberJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const updateSpaceMemberRoute = createRoute({
  method: "put",
  path: "/{spaceId}/members/{userId}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateSpaceMemberInputSchema,
        },
      },
    },
    params: spaceMemberRouteParamsSchema,
  },
  responses: {
    200: spaceMemberJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const removeSpaceMemberRoute = createRoute({
  method: "delete",
  path: "/{spaceId}/members/{userId}",
  request: {
    params: spaceMemberRouteParamsSchema,
  },
  responses: {
    204: {
      description: "Space member removed.",
    },
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
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
    })
    .openapi(listSpaceMembersRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);
      const { spaceId } = context.req.valid("param");

      return context.json(
        await service.listSpaceMembers(user.id, spaceId),
        200,
      );
    })
    .openapi(searchSpaceUsersRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);
      const { spaceId } = context.req.valid("param");

      return context.json(
        await service.searchSpaceUsers(
          user.id,
          spaceId,
          context.req.valid("query"),
        ),
        200,
      );
    })
    .openapi(addSpaceMemberRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);
      const { spaceId } = context.req.valid("param");
      const member = await service.addSpaceMember(
        user.id,
        spaceId,
        context.req.valid("json"),
      );

      return context.json(member, 201);
    })
    .openapi(updateSpaceMemberRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);
      const { spaceId, userId } = context.req.valid("param");
      const member = await service.updateSpaceMemberRole(
        user.id,
        spaceId,
        userId,
        context.req.valid("json"),
      );

      return context.json(member, 200);
    })
    .openapi(removeSpaceMemberRoute, async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);
      const { spaceId, userId } = context.req.valid("param");

      await service.removeSpaceMember(user.id, spaceId, userId);

      return context.body(null, 204);
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
