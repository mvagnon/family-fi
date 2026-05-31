import type { SpaceRepository } from "../../domain/space-repository.js";
import type { SpaceRole, SpaceSummary } from "../../domain/spaces.js";

interface InMemoryMembership {
  role: SpaceRole;
  spaceId: string;
  userId: string;
}

interface InMemorySpace {
  id: string;
  name: string;
}

interface InMemorySpacesRepositoryOptions {
  memberships?: InMemoryMembership[];
  settings?: Map<string, string>;
  spaces?: InMemorySpace[];
}

export function createInMemorySpacesRepository(
  options: InMemorySpacesRepositoryOptions = {},
): SpaceRepository {
  const spaces = new Map(
    (options.spaces ?? []).map((space) => [space.id, { ...space }]),
  );
  const memberships = (options.memberships ?? []).map((membership) => ({
    ...membership,
  }));
  const settings = new Map(options.settings ?? []);

  return {
    async findUserSettings(userId) {
      return {
        defaultSpaceId: settings.get(userId) ?? null,
      };
    },
    async hasMembership(userId, spaceId) {
      return memberships.some(
        (membership) =>
          membership.spaceId === spaceId && membership.userId === userId,
      );
    },
    async listSpacesForUser(userId) {
      return memberships
        .filter((membership) => membership.userId === userId)
        .map((membership): SpaceSummary => {
          const space = spaces.get(membership.spaceId);

          return {
            id: membership.spaceId,
            name: space?.name ?? membership.spaceId,
            role: membership.role,
          };
        });
    },
    async setDefaultSpaceId(userId, defaultSpaceId) {
      settings.set(userId, defaultSpaceId);

      return {
        defaultSpaceId,
      };
    },
  };
}
