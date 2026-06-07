import type { PrismaClient } from "../../../../generated/prisma/client.js";
import type { SpaceRepository } from "../../domain/space-repository.js";
import type {
  SpaceRole,
  SpaceSummary,
  SupportedCurrency,
  UserSettings,
} from "../../domain/spaces.js";
import { supportedCurrencySchema } from "../../domain/spaces.js";

interface SpaceMembershipWithSpace {
  role: string;
  space: {
    currencyCode: string;
    id: string;
    memberships: {
      user: {
        email: string;
      };
    }[];
    name: string;
  };
}

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
              select: {
                user: {
                  select: {
                    email: true,
                  },
                },
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

    return memberships.map(toSpaceSummary);
  }

  async setSpaceCurrency(
    userId: string,
    spaceId: string,
    currencyCode: SupportedCurrency,
  ): Promise<SpaceSummary> {
    await this.prisma.space.update({
      data: {
        currencyCode,
      },
      where: {
        id: spaceId,
      },
    });

    const membership = await this.prisma.spaceMembership.findUniqueOrThrow({
      include: {
        space: {
          include: {
            memberships: {
              select: {
                user: {
                  select: {
                    email: true,
                  },
                },
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
      where: {
        spaceId_userId: {
          spaceId,
          userId,
        },
      },
    });

    return toSpaceSummary(membership);
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

function toSpaceSummary(membership: SpaceMembershipWithSpace): SpaceSummary {
  return {
    currencyCode: supportedCurrencySchema.parse(membership.space.currencyCode),
    id: membership.space.id,
    name: membership.space.name,
    ownerEmail:
      membership.space.memberships[0]?.user.email ?? membership.space.name,
    role: toSpaceRole(membership.role),
  };
}

function toSpaceRole(role: string): SpaceRole {
  return role === "owner" ? "owner" : "member";
}

function toUserSettings(defaultSpaceId: string | null): UserSettings {
  return {
    defaultSpaceId,
  };
}
