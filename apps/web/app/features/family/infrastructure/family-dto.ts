import type {
  Family,
  FamilyCategory,
  FamilyMember,
  Movement,
  RecurringLine,
} from "../domain/family";

const invalidFamilyMessage = "La réponse famille est invalide.";

export class FamilyApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyApiError";
  }
}

export function parseFamilyResponse(value: unknown): Family {
  const family = getRecord(value);

  return {
    categories: getArray(family, "categories").map(parseCategory),
    id: getString(family, "id"),
    members: getArray(family, "members").map(parseMember),
    recurringLines: getArray(family, "recurringLines").map(parseRecurringLine),
  };
}

function parseMember(value: unknown): FamilyMember {
  const member = getRecord(value);

  return {
    id: getString(member, "id"),
    isActive: getOptionalBoolean(member, "isActive") ?? true,
    name: getString(member, "name"),
    role: getString(member, "role"),
  };
}

function parseCategory(value: unknown): FamilyCategory {
  const category = getRecord(value);

  return {
    id: getString(category, "id"),
    kind: getCategoryKind(category),
    label: getString(category, "label"),
    ownerId: getOptionalString(category, "ownerId"),
  };
}

function parseRecurringLine(value: unknown): RecurringLine {
  const line = getRecord(value);

  return {
    amount: getFiniteNumber(line, "amount"),
    categoryId: getString(line, "categoryId"),
    description: getString(line, "description"),
    id: getString(line, "id"),
    isEstimate: getBoolean(line, "isEstimate"),
    maxAmount: getOptionalFiniteNumber(line, "maxAmount"),
    minAmount: getOptionalFiniteNumber(line, "minAmount"),
    movement: getMovement(line),
    recurrenceMonths: getPositiveNumber(line, "recurrenceMonths"),
    title: getString(line, "title"),
  };
}

function getCategoryKind(
  value: Record<string, unknown>,
): FamilyCategory["kind"] {
  const kind = getString(value, "kind");

  if (kind === "shared" || kind === "professional") {
    return kind;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getMovement(value: Record<string, unknown>): Movement {
  const movement = getString(value, "movement");

  if (movement === "positive" || movement === "negative") {
    return movement;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getArray(value: Record<string, unknown>, key: string): unknown[] {
  const item = value[key];

  if (Array.isArray(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getString(value: Record<string, unknown>, key: string): string {
  const item = value[key];

  if (typeof item === "string") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getOptionalString(
  value: Record<string, unknown>,
  key: string,
): string | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item === "string") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function parseStringItem(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getBoolean(value: Record<string, unknown>, key: string): boolean {
  const item = value[key];

  if (typeof item === "boolean") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getOptionalBoolean(
  value: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item === "boolean") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getFiniteNumber(value: Record<string, unknown>, key: string): number {
  const item = value[key];

  if (typeof item === "number" && Number.isFinite(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getOptionalFiniteNumber(
  value: Record<string, unknown>,
  key: string,
): number | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item === "number" && Number.isFinite(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getPositiveNumber(
  value: Record<string, unknown>,
  key: string,
): number {
  const item = getFiniteNumber(value, key);

  if (item > 0) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}
