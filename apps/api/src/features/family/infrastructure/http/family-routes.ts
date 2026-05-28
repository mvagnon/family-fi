import { Hono } from "hono";

import type { FamilyService } from "../../application/family-service.js";
import { InvalidFamilyInputError } from "../../domain/family.js";
import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  UpdateRecurringLineInput,
} from "../../domain/family.js";

export function createFamilyRouter(service: FamilyService): Hono {
  const router = new Hono();

  router.get("/", async (context) => {
    return context.json(await service.getFamilyForCurrentUser());
  });

  router.post("/members", async (context) => {
    const input = parseCreateMemberInput(await readJsonObject(context.req));
    const family = await service.addMember(input);

    return context.json(family, 201);
  });

  router.post("/categories", async (context) => {
    const input = parseCreateCategoryInput(await readJsonObject(context.req));
    const family = await service.addCategory(input);

    return context.json(family, 201);
  });

  router.post("/recurring-lines", async (context) => {
    const input = parseRecurringLineInput(await readJsonObject(context.req));
    const family = await service.createRecurringLine(input);

    return context.json(family, 201);
  });

  router.put("/recurring-lines/:id", async (context) => {
    const lineId = context.req.param("id");
    const input = parseRecurringLineInput(await readJsonObject(context.req));
    const family = await service.updateRecurringLine(lineId, input);

    return context.json(family);
  });

  return router;
}

async function readJsonObject(request: {
  json: () => Promise<unknown>;
}): Promise<Record<string, unknown>> {
  const value = await request.json();

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
