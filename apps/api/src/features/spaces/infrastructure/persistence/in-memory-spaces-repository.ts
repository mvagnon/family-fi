import type { SpaceRepository } from "../../domain/space-repository.js";
import type {
  SpaceRole,
  SpaceSummary,
  SupportedCurrency,
} from "../../domain/spaces.js";
import { defaultSpaceCurrency } from "../../domain/spaces.js";

interface InMemoryMembership {
  role: SpaceRole;
  spaceId: string;
  userId: string;
}

interface InMemorySpace {
  currencyCode?: SupportedCurrency;
  id: string;
  name: string;
  ownerEmail?: string;
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
          const ownerMembership = memberships.find(
            (candidate) =>
              candidate.spaceId === membership.spaceId &&
              candidate.role === "owner",
          );

          return {
            currencyCode: space?.currencyCode ?? defaultSpaceCurrency,
            id: membership.spaceId,
            name: space?.name ?? membership.spaceId,
            ownerEmail:
              space?.ownerEmail ??
              ownerMembership?.userId ??
              membership.spaceId,
            role: membership.role,
          };
        });
    },
    async setSpaceCurrency(userId, spaceId, currencyCode) {
      const space = spaces.get(spaceId);

      spaces.set(spaceId, {
        currencyCode,
        id: spaceId,
        name: space?.name ?? spaceId,
        ownerEmail: space?.ownerEmail,
      });

      const membership = memberships.find(
        (candidate) =>
          candidate.spaceId === spaceId && candidate.userId === userId,
      );
      const ownerMembership = memberships.find(
        (candidate) =>
          candidate.spaceId === spaceId && candidate.role === "owner",
      );

      return {
        currencyCode,
        id: spaceId,
        name: space?.name ?? spaceId,
        ownerEmail: space?.ownerEmail ?? ownerMembership?.userId ?? spaceId,
        role: membership?.role ?? "member",
      };
    },
    async setDefaultSpaceId(userId, defaultSpaceId) {
      settings.set(userId, defaultSpaceId);

      return {
        defaultSpaceId,
      };
    },
  };
}
