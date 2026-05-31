import type { SpaceRole, SpaceSummary, UserSettings } from "../domain/spaces";

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

function parseSpaceSummary(value: unknown): SpaceSummary {
  const space = getRecord(value);

  return {
    id: getString(space, "id"),
    name: getString(space, "name"),
    ownerEmail: getString(space, "ownerEmail"),
    role: parseSpaceRole(getString(space, "role")),
  };
}

function parseSpaceRole(value: string): SpaceRole {
  if (value === "owner" || value === "member") {
    return value;
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
