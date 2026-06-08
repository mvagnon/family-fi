import { randomUUID } from "node:crypto";

import type { PrismaClient } from "../../../../generated/prisma/client.js";
import type { SpaceRepository } from "../../domain/space-repository.js";
import type {
  AssignableSpaceRole,
  SpaceMember,
  SpaceRole,
  SpaceSummary,
  SpaceUserSearchResult,
  SupportedCurrency,
  UserSettings,
} from "../../domain/spaces.js";
import {
  spaceRoleSchema,
  supportedCurrencySchema,
} from "../../domain/spaces.js";

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

interface SpaceMembershipWithUser {
  role: string;
  user: {
    email: string;
    id: string;
    name: string;
  };
}

export class PrismaSpacesRepository implements SpaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async addSpaceMember(
    spaceId: string,
    userId: string,
    role: AssignableSpaceRole,
  ): Promise<SpaceMember> {
    const membership = await this.prisma.spaceMembership.create({
      data: {
        id: randomUUID(),
        role,
        spaceId,
        userId,
      },
      include: {
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
    });

    return toSpaceMember(membership);
  }

  async findMembershipRole(
    userId: string,
    spaceId: string,
  ): Promise<SpaceRole | null> {
    const membership = await this.prisma.spaceMembership.findUnique({
      select: {
        role: true,
      },
      where: {
        spaceId_userId: {
          spaceId,
          userId,
        },
      },
    });

    return membership ? toSpaceRole(membership.role) : null;
  }

  async findUserSettings(userId: string): Promise<UserSettings | null> {
    const settings = await this.prisma.userSettings.findUnique({
      where: {
        userId,
      },
    });

    return settings ? toUserSettings(settings.defaultSpaceId) : null;
  }

  async hasUser(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        id: userId,
      },
    });

    return !!user;
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

  async listSpaceMembers(spaceId: string): Promise<SpaceMember[]> {
    const memberships = await this.prisma.spaceMembership.findMany({
      include: {
        user: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      where: {
        spaceId,
      },
    });

    return memberships.map(toSpaceMember);
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

  async removeSpaceMember(spaceId: string, userId: string): Promise<void> {
    await this.prisma.spaceMembership.delete({
      where: {
        spaceId_userId: {
          spaceId,
          userId,
        },
      },
    });
  }

  async searchUsersForSpace(
    spaceId: string,
    query: string,
  ): Promise<SpaceUserSearchResult[]> {
    const users = await this.prisma.user.findMany({
      orderBy: [
        {
          email: "asc",
        },
        {
          name: "asc",
        },
      ],
      select: {
        email: true,
        id: true,
        name: true,
      },
      take: 10,
      where: {
        memberships: {
          none: {
            spaceId,
          },
        },
        OR: [
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return users;
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

  async updateSpaceMemberRole(
    spaceId: string,
    userId: string,
    role: AssignableSpaceRole,
  ): Promise<SpaceMember> {
    const membership = await this.prisma.spaceMembership.update({
      data: {
        role,
      },
      include: {
        user: {
          select: {
            email: true,
            id: true,
            name: true,
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

    return toSpaceMember(membership);
  }
}

function toSpaceMember(membership: SpaceMembershipWithUser): SpaceMember {
  return {
    email: membership.user.email,
    name: membership.user.name,
    role: toSpaceRole(membership.role),
    userId: membership.user.id,
  };
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
  if (role === "member") {
    return "write";
  }

  return spaceRoleSchema.parse(role);
}

function toUserSettings(defaultSpaceId: string | null): UserSettings {
  return {
    defaultSpaceId,
  };
}
