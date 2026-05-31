import { hashPassword } from "better-auth/crypto";

import type { Prisma, PrismaClient } from "../generated/prisma/client.js";
import { createSeedFamily } from "../features/family/domain/seed-family.js";

const DEV_USER_EMAIL = "test@test.com";
const DEV_USER_ID = "dev-user";
const DEV_USER_NAME = "Test User";
const DEV_USER_PASSWORD = "Test2026!";
const DEV_SPACE_ID = "dev-personal-space";
const DEV_SPACE_NAME = "Personal space";

export async function seedDevData(prisma: PrismaClient): Promise<void> {
  const password = await hashPassword(DEV_USER_PASSWORD);
  const existingUser = await prisma.user.findUnique({
    where: {
      email: DEV_USER_EMAIL,
    },
  });
  const userId = existingUser?.id ?? DEV_USER_ID;

  await prisma.$transaction(async (transaction) => {
    await transaction.user.upsert({
      create: {
        email: DEV_USER_EMAIL,
        emailVerified: true,
        id: userId,
        name: DEV_USER_NAME,
      },
      update: {
        emailVerified: true,
        name: existingUser?.name || DEV_USER_NAME,
      },
      where: {
        id: userId,
      },
    });

    await transaction.account.upsert({
      create: {
        accountId: userId,
        id: `credential-${userId}`,
        password,
        providerId: "credential",
        userId,
      },
      update: {
        accountId: userId,
        password,
        providerId: "credential",
      },
      where: {
        id: `credential-${userId}`,
      },
    });

    await transaction.space.upsert({
      create: {
        id: DEV_SPACE_ID,
        name: DEV_SPACE_NAME,
      },
      update: {
        name: DEV_SPACE_NAME,
      },
      where: {
        id: DEV_SPACE_ID,
      },
    });

    await transaction.spaceMembership.upsert({
      create: {
        id: `owner-${userId}-${DEV_SPACE_ID}`,
        role: "owner",
        spaceId: DEV_SPACE_ID,
        userId,
      },
      update: {
        role: "owner",
      },
      where: {
        spaceId_userId: {
          spaceId: DEV_SPACE_ID,
          userId,
        },
      },
    });

    await transaction.userSettings.upsert({
      create: {
        defaultSpaceId: DEV_SPACE_ID,
        userId,
      },
      update: {
        defaultSpaceId: DEV_SPACE_ID,
      },
      where: {
        userId,
      },
    });

    const existingFamily = await transaction.family.findUnique({
      where: {
        spaceId: DEV_SPACE_ID,
      },
    });

    if (!existingFamily) {
      const seedFamily = createSeedFamily();

      await transaction.family.create({
        data: {
          categories: toJsonValue(seedFamily.categories),
          id: seedFamily.id,
          members: toJsonValue(seedFamily.members),
          recurringLines: {
            create: seedFamily.recurringLines.map((line) => ({
              amountCents: toCents(line.amount),
              categoryId: line.categoryId,
              description: line.description,
              id: line.id,
              isEstimate: line.isEstimate,
              maxAmountCents:
                line.maxAmount === undefined ? null : toCents(line.maxAmount),
              minAmountCents:
                line.minAmount === undefined ? null : toCents(line.minAmount),
              movement: line.movement,
              recurrenceMonths: line.recurrenceMonths,
              title: line.title,
            })),
          },
          spaceId: DEV_SPACE_ID,
        },
      });
    }
  });
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}
