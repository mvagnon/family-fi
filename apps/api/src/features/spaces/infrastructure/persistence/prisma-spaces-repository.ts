import type { PrismaClient } from "../../../../generated/prisma/client.js";
import type { SpaceRepository } from "../../domain/space-repository.js";
import type {
  SpaceRole,
  SpaceSummary,
  UserSettings,
} from "../../domain/spaces.js";

export class PrismaSpacesRepository implements SpaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = await this.prisma.userSettings.findUnique({
      where: {
        userId,
      },
    });

    return settings ? toUserSettings(settings.defaultSpaceId) : null;
  }

  async hasMembership(userId: string, spaceId: string): Promise<boolean> {
    const membership = await this.prisma.spaceMembership.findUnique({
      select: {
        id: true,
      },
      where: {
        spaceId_userId: {
          spaceId,
          userId,
        },
      },
    });

    return !!membership;
  }

  async listSpacesForUser(userId: string): Promise<SpaceSummary[]> {
    const memberships = await this.prisma.spaceMembership.findMany({
      include: {
        space: {
          include: {
            memberships: {
              include: {
                user: true,
              },
              orderBy: {
                createdAt: "asc",
              },
              take: 1,
              where: {
                role: "owner",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      where: {
        userId,
      },
    });

    return memberships.map((membership) => ({
      id: membership.space.id,
      name: membership.space.name,
      ownerEmail:
        membership.space.memberships[0]?.user.email ?? membership.space.name,
      role: toSpaceRole(membership.role),
    }));
  }

  async setDefaultSpaceId(
    userId: string,
    defaultSpaceId: string,
  ): Promise<UserSettings> {
    const settings = await this.prisma.userSettings.upsert({
      create: {
        defaultSpaceId,
        userId,
      },
      update: {
        defaultSpaceId,
      },
      where: {
        userId,
      },
    });

    return toUserSettings(settings.defaultSpaceId);
  }
}

function toSpaceRole(role: string): SpaceRole {
  return role === "owner" ? "owner" : "member";
}

function toUserSettings(defaultSpaceId: string | null): UserSettings {
  return {
    defaultSpaceId,
  };
}
