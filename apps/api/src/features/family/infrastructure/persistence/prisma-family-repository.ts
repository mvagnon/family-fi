import type {
  Prisma,
  PrismaClient,
} from "../../../../generated/prisma/client.js";
import type {
  FamilyCategory,
  FamilyMember,
  FamilySnapshot,
  ParticipationLine,
  RecurringLine,
} from "../../domain/family.js";
import type { FamilyRepository } from "../../domain/family-repository.js";

const familyInclude = {
  participationLines: {
    orderBy: [
      { year: "asc" as const },
      { month: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
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

type ParticipationLineRecord = FamilyRecord["participationLines"][number];

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
        participationLines: {
          create: family.participationLines.map(toParticipationLineCreateInput),
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

  async createParticipationLine(
    familyId: string,
    line: ParticipationLine,
  ): Promise<FamilySnapshot> {
    await this.prisma.participationLine.create({
      data: {
        ...toParticipationLineCreateInput(line),
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

      await prisma.participationLine.deleteMany({
        where: {
          familyId,
          memberId,
        },
      });

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
    participationLines: family.participationLines.map(toParticipationLine),
    recurringLines: family.recurringLines.map(toRecurringLine),
  };
}

function toParticipationLineCreateInput(line: ParticipationLine) {
  return {
    amountCents: toCents(line.amount),
    createdAt: new Date(line.createdAt),
    id: line.id,
    memberId: line.memberId,
    month: line.month,
    year: line.year,
  };
}

function toParticipationLine(line: ParticipationLineRecord): ParticipationLine {
  return {
    amount: fromCents(line.amountCents),
    createdAt: line.createdAt.toISOString(),
    id: line.id,
    memberId: line.memberId,
    month: line.month,
    year: line.year,
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
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return [];
    }

    const member = item as Record<string, unknown>;
    const id = member.id;
    const name = member.name;
    const role = member.role;
    const isActive = member.isActive;

    if (
      typeof id !== "string" ||
      typeof name !== "string" ||
      typeof role !== "string"
    ) {
      return [];
    }

    return [
      {
        id,
        isActive: typeof isActive === "boolean" ? isActive : true,
        name,
        role,
      },
    ];
  });
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
