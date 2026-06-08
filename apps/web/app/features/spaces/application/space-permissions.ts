import type { SpaceRole, SpaceSummary } from "../domain/spaces";

export interface SpacePermissions {
  canManageSpace: boolean;
  canRead: boolean;
  canWrite: boolean;
}

export function getSpacePermissions(
  space: SpaceSummary | null,
): SpacePermissions {
  const role = space?.role ?? null;

  return {
    canManageSpace: canManageSpace(role),
    canRead: canReadSpace(role),
    canWrite: canWriteSpace(role),
  };
}

export function canReadSpace(role: SpaceRole | null): boolean {
  return role === "owner" || role === "write" || role === "read";
}

export function canWriteSpace(role: SpaceRole | null): boolean {
  return role === "owner" || role === "write";
}

export function canManageSpace(role: SpaceRole | null): boolean {
  return role === "owner";
}
