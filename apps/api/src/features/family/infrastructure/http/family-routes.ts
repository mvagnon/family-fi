import { createRoute, z } from "@hono/zod-openapi";
import type { Context } from "hono";

import {
  getAuthenticatedUser,
  type AuthSessionReader,
} from "../../../auth/infrastructure/http/current-user.js";
import {
  createOpenApiRouter,
  errorResponseSchema,
  jsonResponse,
} from "../../../../infrastructure/http/openapi.js";
import type { FamilyService } from "../../application/family-service.js";
import {
  createFamilyCategoryInputSchema,
  createFamilyMemberInputSchema,
  distributionLineInputSchema,
  familySchema,
  loanInputSchema,
  loanRepaymentLineInputSchema,
  participationLineInputSchema,
  recurringLineInputSchema,
  updateGeneratedRecurringLineSettingInputSchema,
  updateLoanInputSchema,
  updateFamilyMemberInputSchema,
} from "../../domain/family.js";

interface FamilyRouteRequest {
  spaceId: string;
  userId: string;
}

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

const familyRouteParamsSchema = z.object({
  spaceId: pathIdSchema("spaceId", "test-space"),
});

const familyEntityRouteParamsSchema = familyRouteParamsSchema.extend({
  id: pathIdSchema("id", "rent"),
});

const familyJsonResponse = jsonResponse("Family snapshot.", familySchema);
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
  "Entity was not found.",
  errorResponseSchema,
);

const getFamilyRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    params: familyRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const createMemberRoute = createRoute({
  method: "post",
  path: "/members",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createFamilyMemberInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    201: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const updateMemberRoute = createRoute({
  method: "put",
  path: "/members/{id}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateFamilyMemberInputSchema,
        },
      },
    },
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const deleteMemberRoute = createRoute({
  method: "delete",
  path: "/members/{id}",
  request: {
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const createCategoryRoute = createRoute({
  method: "post",
  path: "/categories",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createFamilyCategoryInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    201: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const deleteCategoryRoute = createRoute({
  method: "delete",
  path: "/categories/{id}",
  request: {
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const createRecurringLineRoute = createRoute({
  method: "post",
  path: "/recurring-lines",
  request: {
    body: {
      content: {
        "application/json": {
          schema: recurringLineInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    201: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const createParticipationLineRoute = createRoute({
  method: "post",
  path: "/participation-lines",
  request: {
    body: {
      content: {
        "application/json": {
          schema: participationLineInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    201: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const createDistributionLineRoute = createRoute({
  method: "post",
  path: "/distribution-lines",
  request: {
    body: {
      content: {
        "application/json": {
          schema: distributionLineInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    201: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const createLoanRoute = createRoute({
  method: "post",
  path: "/loans",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loanInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    201: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const updateLoanRoute = createRoute({
  method: "put",
  path: "/loans/{id}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateLoanInputSchema,
        },
      },
    },
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const deleteLoanRoute = createRoute({
  method: "delete",
  path: "/loans/{id}",
  request: {
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const createLoanRepaymentLineRoute = createRoute({
  method: "post",
  path: "/loan-repayment-lines",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loanRepaymentLineInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    201: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
  },
});

const updateLoanRepaymentLineRoute = createRoute({
  method: "put",
  path: "/loan-repayment-lines/{id}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: loanRepaymentLineInputSchema,
        },
      },
    },
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const deleteLoanRepaymentLineRoute = createRoute({
  method: "delete",
  path: "/loan-repayment-lines/{id}",
  request: {
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const updateParticipationLineRoute = createRoute({
  method: "put",
  path: "/participation-lines/{id}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: participationLineInputSchema,
        },
      },
    },
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const updateDistributionLineRoute = createRoute({
  method: "put",
  path: "/distribution-lines/{id}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: distributionLineInputSchema,
        },
      },
    },
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const updateRecurringLineRoute = createRoute({
  method: "put",
  path: "/recurring-lines/{id}",
  request: {
    body: {
      content: {
        "application/json": {
          schema: recurringLineInputSchema,
        },
      },
    },
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const updateGeneratedRecurringLineSettingRoute = createRoute({
  method: "put",
  path: "/generated-recurring-line-settings",
  request: {
    body: {
      content: {
        "application/json": {
          schema: updateGeneratedRecurringLineSettingInputSchema,
        },
      },
    },
    params: familyRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    400: validationErrorResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const deleteRecurringLineRoute = createRoute({
  method: "delete",
  path: "/recurring-lines/{id}",
  request: {
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const deleteParticipationLineRoute = createRoute({
  method: "delete",
  path: "/participation-lines/{id}",
  request: {
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

const deleteDistributionLineRoute = createRoute({
  method: "delete",
  path: "/distribution-lines/{id}",
  request: {
    params: familyEntityRouteParamsSchema,
  },
  responses: {
    200: familyJsonResponse,
    401: unauthenticatedResponse,
    403: accessDeniedResponse,
    404: notFoundResponse,
  },
});

export function createFamilyRouter(
  service: FamilyService,
  authProvider: AuthSessionReader,
) {
  return createOpenApiRouter()
    .openapi(getFamilyRoute, async (context) => {
      return context.json(
        await service.getFamilyForSpace(
          await getFamilyRouteRequest(context, authProvider),
        ),
        200,
      );
    })
    .openapi(createMemberRoute, async (context) => {
      const family = await service.addMember(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 201);
    })
    .openapi(updateMemberRoute, async (context) => {
      const family = await service.updateMember(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
        context.req.valid("json"),
      );

      return context.json(family, 200);
    })
    .openapi(deleteMemberRoute, async (context) => {
      const family = await service.deleteMember(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
      );

      return context.json(family, 200);
    })
    .openapi(createCategoryRoute, async (context) => {
      const family = await service.addCategory(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 201);
    })
    .openapi(deleteCategoryRoute, async (context) => {
      const family = await service.deleteCategory(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
      );

      return context.json(family, 200);
    })
    .openapi(createRecurringLineRoute, async (context) => {
      const family = await service.createRecurringLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 201);
    })
    .openapi(createParticipationLineRoute, async (context) => {
      const family = await service.createParticipationLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 201);
    })
    .openapi(createDistributionLineRoute, async (context) => {
      const family = await service.createDistributionLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 201);
    })
    .openapi(createLoanRoute, async (context) => {
      const family = await service.createLoan(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 201);
    })
    .openapi(updateLoanRoute, async (context) => {
      const family = await service.updateLoan(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
        context.req.valid("json"),
      );

      return context.json(family, 200);
    })
    .openapi(deleteLoanRoute, async (context) => {
      const family = await service.deleteLoan(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
      );

      return context.json(family, 200);
    })
    .openapi(createLoanRepaymentLineRoute, async (context) => {
      const family = await service.createLoanRepaymentLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 201);
    })
    .openapi(updateLoanRepaymentLineRoute, async (context) => {
      const family = await service.updateLoanRepaymentLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
        context.req.valid("json"),
      );

      return context.json(family, 200);
    })
    .openapi(deleteLoanRepaymentLineRoute, async (context) => {
      const family = await service.deleteLoanRepaymentLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
      );

      return context.json(family, 200);
    })
    .openapi(updateParticipationLineRoute, async (context) => {
      const family = await service.updateParticipationLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
        context.req.valid("json"),
      );

      return context.json(family, 200);
    })
    .openapi(updateDistributionLineRoute, async (context) => {
      const family = await service.updateDistributionLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
        context.req.valid("json"),
      );

      return context.json(family, 200);
    })
    .openapi(deleteParticipationLineRoute, async (context) => {
      const family = await service.deleteParticipationLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
      );

      return context.json(family, 200);
    })
    .openapi(deleteDistributionLineRoute, async (context) => {
      const family = await service.deleteDistributionLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
      );

      return context.json(family, 200);
    })
    .openapi(updateRecurringLineRoute, async (context) => {
      const family = await service.updateRecurringLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
        context.req.valid("json"),
      );

      return context.json(family, 200);
    })
    .openapi(updateGeneratedRecurringLineSettingRoute, async (context) => {
      const family = await service.updateGeneratedRecurringLineSetting(
        await getFamilyRouteRequest(context, authProvider),
        context.req.valid("json"),
      );

      return context.json(family, 200);
    })
    .openapi(deleteRecurringLineRoute, async (context) => {
      const family = await service.deleteRecurringLine(
        await getFamilyRouteRequest(context, authProvider),
        context.req.param("id"),
      );

      return context.json(family, 200);
    });
}

async function getFamilyRouteRequest(
  context: Context,
  authProvider: AuthSessionReader,
): Promise<FamilyRouteRequest> {
  const user = await getAuthenticatedUser(context, authProvider);

  return {
    spaceId: context.req.param("spaceId") ?? "",
    userId: user.id,
  };
}
