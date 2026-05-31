import type {
  Prisma,
  PrismaClient,
} from "../../../../generated/prisma/client.js";
import type {
  FamilyCategory,
  FamilyMember,
  FamilySnapshot,
  RecurringLine,
} from "../../domain/family.js";
import type { FamilyRepository } from "../../domain/family-repository.js";

const familyInclude = {
  recurringLines: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
} satisfies Prisma.FamilyInclude;

type FamilyRecord = Prisma.FamilyGetPayload<{
  include: typeof familyInclude;
}>;

type RecurringLineRecord = FamilyRecord["recurringLines"][number];

export class PrismaFamilyRepository implements FamilyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createFamily(
    spaceId: string,
    family: FamilySnapshot,
  ): Promise<FamilySnapshot> {
    const createdFamily = await this.prisma.family.create({
      data: {
        categories: toJsonValue(family.categories),
        id: family.id,
        members: toJsonValue(family.members),
        recurringLines: {
          create: family.recurringLines.map(toRecurringLineCreateInput),
        },
        spaceId,
      },
      include: familyInclude,
    });

    return toFamilySnapshot(createdFamily);
  }

  async createRecurringLine(
    familyId: string,
    line: RecurringLine,
  ): Promise<FamilySnapshot> {
    await this.prisma.recurringLine.create({
      data: {
        ...toRecurringLineCreateInput(line),
        familyId,
      },
    });

    return this.getFamilyById(familyId);
  }

  async deleteRecurringLine(
    familyId: string,
    lineId: string,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.recurringLine.deleteMany({
      where: {
        familyId,
        id: lineId,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.getFamilyById(familyId);
  }

  async deleteMember(
    familyId: string,
    memberId: string,
  ): Promise<FamilySnapshot | null> {
    return this.prisma.$transaction(async (prisma) => {
      const family = await prisma.family.findUniqueOrThrow({
        include: familyInclude,
        where: {
          id: familyId,
        },
      });
      const snapshot = toFamilySnapshot(family);
      const hasMember = snapshot.members.some(
        (member) => member.id === memberId,
      );

      if (!hasMember) {
        return null;
      }

      const linkedCategoryIds = snapshot.categories
        .filter((category) => category.ownerId === memberId)
        .map((category) => category.id);

      if (linkedCategoryIds.length > 0) {
        await prisma.recurringLine.deleteMany({
          where: {
            categoryId: {
              in: linkedCategoryIds,
            },
            familyId,
          },
        });
      }

      const updatedFamily = await prisma.family.update({
        data: {
          categories: toJsonValue(
            snapshot.categories.filter(
              (category) => category.ownerId !== memberId,
            ),
          ),
          members: toJsonValue(
            snapshot.members.filter((member) => member.id !== memberId),
          ),
        },
        include: familyInclude,
        where: {
          id: familyId,
        },
      });

      return toFamilySnapshot(updatedFamily);
    });
  }

  async deleteCategory(
    familyId: string,
    categoryId: string,
  ): Promise<FamilySnapshot | null> {
    return this.prisma.$transaction(async (prisma) => {
      const family = await prisma.family.findUniqueOrThrow({
        include: familyInclude,
        where: {
          id: familyId,
        },
      });
      const snapshot = toFamilySnapshot(family);
      const hasCategory = snapshot.categories.some(
        (category) => category.id === categoryId,
      );

      if (!hasCategory) {
        return null;
      }

      await prisma.recurringLine.deleteMany({
        where: {
          categoryId,
          familyId,
        },
      });

      const updatedFamily = await prisma.family.update({
        data: {
          categories: toJsonValue(
            snapshot.categories.filter(
              (category) => category.id !== categoryId,
            ),
          ),
        },
        include: familyInclude,
        where: {
          id: familyId,
        },
      });

      return toFamilySnapshot(updatedFamily);
    });
  }

  async findBySpaceId(spaceId: string): Promise<FamilySnapshot | null> {
    const family = await this.prisma.family.findUnique({
      include: familyInclude,
      where: {
        spaceId,
      },
    });

    return family ? toFamilySnapshot(family) : null;
  }

  async saveFamily(family: FamilySnapshot): Promise<FamilySnapshot> {
    const updatedFamily = await this.prisma.family.update({
      data: {
        categories: toJsonValue(family.categories),
        members: toJsonValue(family.members),
      },
      include: familyInclude,
      where: {
        id: family.id,
      },
    });

    return toFamilySnapshot(updatedFamily);
  }

  async updateRecurringLine(
    familyId: string,
    line: RecurringLine,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.recurringLine.updateMany({
      data: toRecurringLineUpdateInput(line),
      where: {
        familyId,
        id: line.id,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.getFamilyById(familyId);
  }

  private async getFamilyById(familyId: string): Promise<FamilySnapshot> {
    const family = await this.prisma.family.findUniqueOrThrow({
      include: familyInclude,
      where: {
        id: familyId,
      },
    });

    return toFamilySnapshot(family);
  }
}

function toRecurringLineCreateInput(line: RecurringLine) {
  return {
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
  };
}

function toRecurringLineUpdateInput(line: RecurringLine) {
  return {
    amountCents: toCents(line.amount),
    categoryId: line.categoryId,
    description: line.description,
    isEstimate: line.isEstimate,
    maxAmountCents:
      line.maxAmount === undefined ? null : toCents(line.maxAmount),
    minAmountCents:
      line.minAmount === undefined ? null : toCents(line.minAmount),
    movement: line.movement,
    recurrenceMonths: line.recurrenceMonths,
    title: line.title,
  };
}

function toFamilySnapshot(family: FamilyRecord): FamilySnapshot {
  return {
    categories: parseCategories(family.categories),
    id: family.id,
    members: parseMembers(family.members),
    recurringLines: family.recurringLines.map(toRecurringLine),
  };
}

function toRecurringLine(line: RecurringLineRecord): RecurringLine {
  return {
    amount: fromCents(line.amountCents),
    categoryId: line.categoryId,
    description: line.description,
    id: line.id,
    isEstimate: line.isEstimate,
    maxAmount:
      line.maxAmountCents === null ? undefined : fromCents(line.maxAmountCents),
    minAmount:
      line.minAmountCents === null ? undefined : fromCents(line.minAmountCents),
    movement: line.movement === "positive" ? "positive" : "negative",
    recurrenceMonths: line.recurrenceMonths,
    title: line.title,
  };
}

function parseMembers(value: unknown): FamilyMember[] {
  return Array.isArray(value) ? (value as FamilyMember[]) : [];
}

function parseCategories(value: unknown): FamilyCategory[] {
  return Array.isArray(value) ? (value as FamilyCategory[]) : [];
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function toCents(value: number): number {
  return Math.round(value * 100);
}

function fromCents(value: number): number {
  return value / 100;
}
