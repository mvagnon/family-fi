import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family,
  UpdateRecurringLineInput,
} from "../domain/family";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export class FamilyApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyApiError";
  }
}

export async function fetchFamily(): Promise<Family> {
  return requestFamily("");
}

export async function addFamilyMember(
  input: CreateFamilyMemberInput,
): Promise<Family> {
  return requestFamily("/members", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function addFamilyCategory(
  input: CreateFamilyCategoryInput,
): Promise<Family> {
  return requestFamily("/categories", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function createFamilyRecurringLine(
  input: CreateRecurringLineInput,
): Promise<Family> {
  return requestFamily("/recurring-lines", {
    body: JSON.stringify(input),
    method: "POST",
  });
}

export async function updateFamilyRecurringLine(
  lineId: string,
  input: UpdateRecurringLineInput,
): Promise<Family> {
  return requestFamily(`/recurring-lines/${lineId}`, {
    body: JSON.stringify(input),
    method: "PUT",
  });
}

async function requestFamily(
  path: string,
  init: RequestInit = {},
): Promise<Family> {
  const response = await fetch(`${apiBaseUrl}/api/family${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new FamilyApiError(await getErrorMessage(response));
  }

  return parseFamily(await response.json());
}

async function getErrorMessage(response: Response): Promise<string> {
  const value = await response.json().catch(() => null);

  if (isRecord(value) && typeof value.message === "string") {
    return value.message;
  }

  return "La famille n'a pas pu être chargée.";
}

function parseFamily(value: unknown): Family {
  if (!isRecord(value)) {
    throw new FamilyApiError("La réponse famille est invalide.");
  }

  return {
    categories: Array.isArray(value.categories) ? value.categories : [],
    id: getString(value, "id"),
    members: Array.isArray(value.members) ? value.members : [],
    recurringLines: Array.isArray(value.recurringLines)
      ? value.recurringLines
      : [],
    userIds: Array.isArray(value.userIds) ? value.userIds : [],
  } as Family;
}

function getString(value: Record<string, unknown>, key: string): string {
  const item = value[key];

  if (typeof item !== "string") {
    throw new FamilyApiError("La réponse famille est invalide.");
  }

  return item;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
