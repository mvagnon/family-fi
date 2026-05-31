import { Hono } from "hono";
import { validator } from "hono/validator";

import type { AuthProvider } from "../../../auth/domain/auth.js";
import { getAuthenticatedUser } from "../../../auth/infrastructure/http/current-user.js";
import type { SpacesService } from "../../application/spaces-service.js";
import {
  InvalidSpaceInputError,
  updateDefaultSpaceInputSchema,
} from "../../domain/spaces.js";
import type { UpdateDefaultSpaceInput } from "../../domain/spaces.js";

export function createSpacesRouter(
  service: SpacesService,
  authProvider: AuthProvider,
) {
  return new Hono().get("/", async (context) => {
    const user = await getAuthenticatedUser(context, authProvider);

    return context.json(await service.listSpacesForUser(user.id));
  });
}

export function createMeRouter(
  service: SpacesService,
  authProvider: AuthProvider,
) {
  return new Hono()
    .get("/settings", async (context) => {
      const user = await getAuthenticatedUser(context, authProvider);

      return context.json(await service.getUserSettings(user.id));
    })
    .put(
      "/settings/default-space",
      validateJson(parseUpdateDefaultSpaceInput),
      async (context) => {
        const user = await getAuthenticatedUser(context, authProvider);
        const settings = await service.updateDefaultSpace(
          user.id,
          context.req.valid("json"),
        );

        return context.json(settings);
      },
    );
}

function validateJson<T>(parse: (value: Record<string, unknown>) => T) {
  return validator("json", (value) => parse(readJsonObject(value)));
}

function parseUpdateDefaultSpaceInput(
  value: Record<string, unknown>,
): UpdateDefaultSpaceInput {
  const result = updateDefaultSpaceInputSchema.safeParse(value);

  if (!result.success) {
    throw new InvalidSpaceInputError(
      result.error.issues[0]?.message ?? "Default space input is invalid.",
    );
  }

  return result.data;
}

function readJsonObject(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new InvalidSpaceInputError("Request body must be a JSON object.");
  }

  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
