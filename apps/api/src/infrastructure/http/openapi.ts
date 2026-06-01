import { OpenAPIHono, z } from "@hono/zod-openapi";

export const OPENAPI_JSON_PATH = "/api/openapi.json";
export const SWAGGER_UI_PATH = "/api/docs";

export const errorResponseSchema = z
  .object({
    message: z.string(),
  })
  .meta({ id: "ErrorResponse" });

export function createOpenApiRouter() {
  return new OpenAPIHono({
    defaultHook: (result, context) => {
      if (result.success) {
        return;
      }

      return context.json(
        {
          message: getValidationErrorMessage(result.error),
        },
        400,
      );
    },
  });
}

export function jsonResponse(description: string, schema: z.ZodType) {
  return {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
  };
}

function getValidationErrorMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Request input is invalid.";
}
