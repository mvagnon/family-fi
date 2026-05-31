import type { SpaceSummary, UserSettings } from "../domain/spaces";

interface ResolveActiveSpaceInput {
  activeSpaceId: string | null;
  settings: UserSettings | null;
  spaces: SpaceSummary[];
}

export function resolveActiveSpaceId({
  activeSpaceId,
  settings,
  spaces,
}: ResolveActiveSpaceInput): string | null {
  if (activeSpaceId && hasAccessibleSpace(spaces, activeSpaceId)) {
    return activeSpaceId;
  }

  if (
    settings?.defaultSpaceId &&
    hasAccessibleSpace(spaces, settings.defaultSpaceId)
  ) {
    return settings.defaultSpaceId;
  }

  return spaces[0]?.id ?? null;
}

export function hasAccessibleSpace(
  spaces: SpaceSummary[],
  spaceId: string,
): boolean {
  return spaces.some((space) => space.id === spaceId);
}
