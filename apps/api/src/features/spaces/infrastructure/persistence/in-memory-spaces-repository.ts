import type { SpaceRepository } from "../../domain/space-repository.js";
import type {
  SpaceMember,
  SpaceRole,
  SpaceSummary,
  SpaceUserSearchResult,
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

interface InMemoryUser {
  email: string;
  id: string;
  name: string;
}

interface InMemorySpacesRepositoryOptions {
  memberships?: InMemoryMembership[];
  settings?: Map<string, string>;
  spaces?: InMemorySpace[];
  users?: InMemoryUser[];
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
  const users = new Map(
    (options.users ?? []).map((user) => [user.id, { ...user }]),
  );

  return {
    async addSpaceMember(spaceId, userId, role) {
      const membership = {
        role,
        spaceId,
        userId,
      };

      memberships.push(membership);

      return toSpaceMember(membership, users);
    },
    async findMembershipRole(userId, spaceId) {
      return (
        memberships.find(
          (membership) =>
            membership.spaceId === spaceId && membership.userId === userId,
        )?.role ?? null
      );
    },
    async findUserSettings(userId) {
      return {
        defaultSpaceId: settings.get(userId) ?? null,
      };
    },
    async hasUser(userId) {
      return users.has(userId);
    },
    async hasMembership(userId, spaceId) {
      return memberships.some(
        (membership) =>
          membership.spaceId === spaceId && membership.userId === userId,
      );
    },
    async listSpaceMembers(spaceId) {
      return memberships
        .filter((membership) => membership.spaceId === spaceId)
        .map((membership) => toSpaceMember(membership, users));
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
    async removeSpaceMember(spaceId, userId) {
      const membershipIndex = memberships.findIndex(
        (membership) =>
          membership.spaceId === spaceId && membership.userId === userId,
      );

      if (membershipIndex >= 0) {
        memberships.splice(membershipIndex, 1);
      }
    },
    async searchUsersForSpace(spaceId, query) {
      const normalizedQuery = query.trim().toLowerCase();
      const memberUserIds = new Set(
        memberships
          .filter((membership) => membership.spaceId === spaceId)
          .map((membership) => membership.userId),
      );

      return [...users.values()]
        .filter(
          (user) =>
            !memberUserIds.has(user.id) &&
            (user.email.toLowerCase().includes(normalizedQuery) ||
              user.name.toLowerCase().includes(normalizedQuery)),
        )
        .sort((left, right) => left.email.localeCompare(right.email))
        .slice(0, 10)
        .map(toSpaceUserSearchResult);
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
        role: membership?.role ?? "read",
      };
    },
    async setDefaultSpaceId(userId, defaultSpaceId) {
      settings.set(userId, defaultSpaceId);

      return {
        defaultSpaceId,
      };
    },
    async updateSpaceMemberRole(spaceId, userId, role) {
      const membership = memberships.find(
        (candidate) =>
          candidate.spaceId === spaceId && candidate.userId === userId,
      );

      if (membership) {
        membership.role = role;
        return toSpaceMember(membership, users);
      }

      return toSpaceMember({ role, spaceId, userId }, users);
    },
  };
}

function toSpaceMember(
  membership: InMemoryMembership,
  users: Map<string, InMemoryUser>,
): SpaceMember {
  const user = users.get(membership.userId);

  return {
    email: user?.email ?? membership.userId,
    name: user?.name ?? membership.userId,
    role: membership.role,
    userId: membership.userId,
  };
}

function toSpaceUserSearchResult(user: InMemoryUser): SpaceUserSearchResult {
  return {
    email: user.email,
    id: user.id,
    name: user.name,
  };
}
