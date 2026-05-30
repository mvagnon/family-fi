import { Hono } from "hono";
import { validator } from "hono/validator";

import type { FamilyService } from "../../application/family-service.js";
import {
  InvalidFamilyInputError,
  recurringLineInputSchema,
} from "../../domain/family.js";
import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  UpdateRecurringLineInput,
} from "../../domain/family.js";

export function createFamilyRouter(service: FamilyService) {
  return new Hono()
    .get("/", async (context) => {
      return context.json(await service.getFamilyForCurrentUser());
    })
    .post("/members", validateJson(parseCreateMemberInput), async (context) => {
      const family = await service.addMember(context.req.valid("json"));

      return context.json(family, 201);
    })
    .delete("/members/:id", async (context) => {
      const memberId = context.req.param("id");
      const family = await service.deleteMember(memberId);

      return context.json(family);
    })
    .post(
      "/categories",
      validateJson(parseCreateCategoryInput),
      async (context) => {
        const family = await service.addCategory(context.req.valid("json"));

        return context.json(family, 201);
      },
    )
    .delete("/categories/:id", async (context) => {
      const categoryId = context.req.param("id");
      const family = await service.deleteCategory(categoryId);

      return context.json(family);
    })
    .post(
      "/recurring-lines",
      validateJson(parseRecurringLineInput),
      async (context) => {
        const family = await service.createRecurringLine(
          context.req.valid("json"),
        );

        return context.json(family, 201);
      },
    )
    .put(
      "/recurring-lines/:id",
      validateJson(parseRecurringLineInput),
      async (context) => {
        const lineId = context.req.param("id");
        const family = await service.updateRecurringLine(
          lineId,
          context.req.valid("json"),
        );

        return context.json(family);
      },
    )
    .delete("/recurring-lines/:id", async (context) => {
      const lineId = context.req.param("id");
      const family = await service.deleteRecurringLine(lineId);

      return context.json(family);
    });
}

function validateJson<T>(parse: (value: Record<string, unknown>) => T) {
  return validator("json", (value) => parse(readJsonObject(value)));
}

function readJsonObject(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new InvalidFamilyInputError("Request body must be a JSON object.");
  }

  return value;
}

function parseCreateMemberInput(
  value: Record<string, unknown>,
): CreateFamilyMemberInput {
  return {
    name: getString(value, "name"),
  };
}

function parseCreateCategoryInput(
  value: Record<string, unknown>,
): CreateFamilyCategoryInput {
  const kind = getOptionalString(value, "kind");
  let categoryKind: CreateFamilyCategoryInput["kind"];

  if (kind === "shared" || kind === "professional") {
    categoryKind = kind;
  } else if (kind) {
    throw new InvalidFamilyInputError("Category kind is invalid.");
  }

  return {
    kind: categoryKind,
    label: getString(value, "label"),
    ownerId: getOptionalString(value, "ownerId"),
  };
}

function parseRecurringLineInput(
  value: Record<string, unknown>,
): CreateRecurringLineInput | UpdateRecurringLineInput {
  const result = recurringLineInputSchema.safeParse(value);

  if (!result.success) {
    throw new InvalidFamilyInputError(
      result.error.issues[0]?.message ?? "Recurring line input is invalid.",
    );
  }

  return result.data;
}

function getString(value: Record<string, unknown>, key: string): string {
  const item = value[key];

  if (typeof item !== "string") {
    throw new InvalidFamilyInputError(`${key} must be a string.`);
  }

  return item;
}

function getOptionalString(
  value: Record<string, unknown>,
  key: string,
): string | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item !== "string") {
    throw new InvalidFamilyInputError(`${key} must be a string.`);
  }

  return item;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
