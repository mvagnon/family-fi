import { Hono } from "hono";
import { validator } from "hono/validator";

import type { FamilyService } from "../../application/family-service.js";
import { InvalidFamilyInputError } from "../../domain/family.js";
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
    .post(
      "/categories",
      validateJson(parseCreateCategoryInput),
      async (context) => {
        const family = await service.addCategory(context.req.valid("json"));

        return context.json(family, 201);
      },
    )
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
    );
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
    categoryLabel: getOptionalString(value, "categoryLabel"),
    name: getString(value, "name"),
    role: getString(value, "role"),
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
  const movement = getString(value, "movement");

  if (movement !== "positive" && movement !== "negative") {
    throw new InvalidFamilyInputError("Recurring line movement is invalid.");
  }

  return {
    amount: getNumber(value, "amount"),
    categoryId: getString(value, "categoryId"),
    description: getOptionalString(value, "description") ?? "",
    isEstimate: getBoolean(value, "isEstimate"),
    maxAmount: getOptionalNumber(value, "maxAmount"),
    minAmount: getOptionalNumber(value, "minAmount"),
    movement,
    recurrenceMonths: getNumber(value, "recurrenceMonths"),
    title: getString(value, "title"),
  };
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

function getNumber(value: Record<string, unknown>, key: string): number {
  const item = value[key];

  if (typeof item !== "number") {
    throw new InvalidFamilyInputError(`${key} must be a number.`);
  }

  return item;
}

function getOptionalNumber(
  value: Record<string, unknown>,
  key: string,
): number | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item !== "number") {
    throw new InvalidFamilyInputError(`${key} must be a number.`);
  }

  return item;
}

function getBoolean(value: Record<string, unknown>, key: string): boolean {
  const item = value[key];

  if (typeof item !== "boolean") {
    throw new InvalidFamilyInputError(`${key} must be a boolean.`);
  }

  return item;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
