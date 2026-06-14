import { PrismaFamilyRepository } from "../../family/infrastructure/persistence/prisma-family-repository.js";
import { createInitialFamily } from "../../family/domain/initial-family.js";
import type { PrismaClient } from "../../../generated/prisma/client.js";

interface ProvisionUserInput {
  id: string;
  identitySubject: string;
}

export async function ensureUserIsProvisioned(
  prisma: PrismaClient,
  user: ProvisionUserInput,
): Promise<void> {
  const existingOwnerMembership = await prisma.spaceMembership.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      spaceId: true,
    },
    where: {
      role: "owner",
      userId: user.id,
    },
  });
  const spaceId =
    existingOwnerMembership?.spaceId ??
    createPersonalSpaceId(user.identitySubject);
  const familyId = `family-${spaceId}`;

  await prisma.$transaction(async (transaction) => {
    await transaction.space.upsert({
      create: {
        id: spaceId,
        name: "Personal space",
      },
      update: {},
      where: {
        id: spaceId,
      },
    });

    await transaction.spaceMembership.upsert({
      create: {
        id: `owner-${user.id}-${spaceId}`,
        role: "owner",
        spaceId,
        userId: user.id,
      },
      update: {
        role: "owner",
      },
      where: {
        spaceId_userId: {
          spaceId,
          userId: user.id,
        },
      },
    });

    await transaction.userSettings.upsert({
      create: {
        defaultSpaceId: spaceId,
        userId: user.id,
      },
      update: {},
      where: {
        userId: user.id,
      },
    });
  });

  const familyRepository = new PrismaFamilyRepository(prisma);
  const existingFamily = await familyRepository.findBySpaceId(spaceId);

  if (!existingFamily) {
    await familyRepository.createFamily(spaceId, createInitialFamily(familyId));
  }
}

function createPersonalSpaceId(userId: string): string {
  return `personal-space-${userId}`;
}
