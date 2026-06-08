import type {
  SpaceMember,
  SpaceRole,
  SpaceSummary,
  SpaceUserSearchResult,
  SupportedCurrency,
  UserSettings,
} from "../domain/spaces";
import { spaceRoleSchema, supportedCurrencySchema } from "../domain/spaces";

export class SpacesApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpacesApiError";
  }
}

export function parseSpacesResponse(value: unknown): SpaceSummary[] {
  if (!Array.isArray(value)) {
    throw new SpacesApiError("Les espaces n'ont pas pu être chargés.");
  }

  return value.map(parseSpaceSummary);
}

export function parseUserSettingsResponse(value: unknown): UserSettings {
  const settings = getRecord(value);
  const defaultSpaceId = settings.defaultSpaceId;

  if (defaultSpaceId !== null && typeof defaultSpaceId !== "string") {
    throw new SpacesApiError("Les réglages n'ont pas pu être chargés.");
  }

  return {
    defaultSpaceId,
  };
}

export function parseSpaceMembersResponse(value: unknown): SpaceMember[] {
  if (!Array.isArray(value)) {
    throw new SpacesApiError(
      "Les membres de l'espace n'ont pas pu être chargés.",
    );
  }

  return value.map(parseSpaceMember);
}

export function parseSpaceUserSearchResponse(
  value: unknown,
): SpaceUserSearchResult[] {
  if (!Array.isArray(value)) {
    throw new SpacesApiError("Les utilisateurs n'ont pas pu être chargés.");
  }

  return value.map(parseSpaceUserSearchResult);
}

function parseSpaceSummary(value: unknown): SpaceSummary {
  const space = getRecord(value);

  return {
    currencyCode: parseSupportedCurrency(getString(space, "currencyCode")),
    id: getString(space, "id"),
    name: getString(space, "name"),
    ownerEmail: getString(space, "ownerEmail"),
    role: parseSpaceRole(getString(space, "role")),
  };
}

function parseSpaceMember(value: unknown): SpaceMember {
  const member = getRecord(value);

  return {
    email: getString(member, "email"),
    name: getString(member, "name"),
    role: parseSpaceRole(getString(member, "role")),
    userId: getString(member, "userId"),
  };
}

function parseSpaceUserSearchResult(value: unknown): SpaceUserSearchResult {
  const user = getRecord(value);

  return {
    email: getString(user, "email"),
    id: getString(user, "id"),
    name: getString(user, "name"),
  };
}

function parseSpaceRole(value: string): SpaceRole {
  if (value === "member") {
    return "write";
  }

  const role = spaceRoleSchema.safeParse(value);

  if (role.success) {
    return role.data;
  }

  throw new SpacesApiError("Les espaces n'ont pas pu être chargés.");
}

function parseSupportedCurrency(value: string): SupportedCurrency {
  const currencyCode = supportedCurrencySchema.safeParse(value);

  if (currencyCode.success) {
    return currencyCode.data;
  }

  throw new SpacesApiError("Les espaces n'ont pas pu être chargés.");
}

function getRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  throw new SpacesApiError("Les espaces n'ont pas pu être chargés.");
}

function getString(value: Record<string, unknown>, key: string): string {
  const item = value[key];

  if (typeof item !== "string") {
    throw new SpacesApiError("Les espaces n'ont pas pu être chargés.");
  }

  return item;
}
