import type {
  Prisma,
  PrismaClient,
} from "../../../../generated/prisma/client.js";
import type {
  DistributionLine,
  FamilyCategory,
  FamilyMember,
  FamilySnapshot,
  GeneratedRecurringLineSetting,
  GeneratedRecurringLineSource,
  Loan,
  LoanRepaymentLine,
  ParticipationLine,
  RecurringLine,
} from "../../domain/family.js";
import type { FamilyRepository } from "../../domain/family-repository.js";

const familyInclude = {
  distributionLines: {
    include: {
      memberAmounts: {
        orderBy: {
          memberId: "asc" as const,
        },
      },
    },
    orderBy: [
      { year: "asc" as const },
      { month: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
  generatedRecurringLineSettings: {
    orderBy: [{ source: "asc" as const }, { sourceId: "asc" as const }],
  },
  loanRepaymentLines: {
    orderBy: [
      { year: "asc" as const },
      { month: "asc" as const },
      { createdAt: "asc" as const },
    ],
  },
  loans: {
    orderBy: {
      createdAt: "asc" as const,
    },
  },
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

type DistributionLineRecord = FamilyRecord["distributionLines"][number];

type LoanRecord = FamilyRecord["loans"][number];

type LoanRepaymentLineRecord = FamilyRecord["loanRepaymentLines"][number];

type GeneratedRecurringLineSettingRecord =
  FamilyRecord["generatedRecurringLineSettings"][number];

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
        distributionLines: {
          create: family.distributionLines.map(toDistributionLineCreateInput),
        },
        generatedRecurringLineSettings: {
          create: family.generatedRecurringLineSettings.map(
            toGeneratedRecurringLineSettingCreateInput,
          ),
        },
        loans: {
          create: family.loans.map(toLoanCreateInput),
        },
        loanRepaymentLines: {
          create: family.loanRepaymentLines.map(toLoanRepaymentLineCreateInput),
        },
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

  async createDistributionLine(
    familyId: string,
    line: DistributionLine,
  ): Promise<FamilySnapshot> {
    await this.prisma.distributionLine.create({
      data: {
        ...toDistributionLineCreateInput(line),
        familyId,
      },
    });

    return this.getFamilyById(familyId);
  }

  async createLoan(familyId: string, loan: Loan): Promise<FamilySnapshot> {
    await this.prisma.loan.create({
      data: {
        ...toLoanCreateInput(loan),
        familyId,
      },
    });

    return this.getFamilyById(familyId);
  }

  async createLoanRepaymentLine(
    familyId: string,
    line: LoanRepaymentLine,
  ): Promise<FamilySnapshot> {
    await this.prisma.loanRepaymentLine.create({
      data: {
        ...toLoanRepaymentLineCreateInput(line),
        familyId,
      },
    });

    return this.getFamilyById(familyId);
  }

  async deleteLoan(
    familyId: string,
    loanId: string,
  ): Promise<FamilySnapshot | null> {
    return this.prisma.$transaction(async (prisma) => {
      const result = await prisma.loan.deleteMany({
        where: {
          familyId,
          id: loanId,
        },
      });

      if (result.count === 0) {
        return null;
      }

      await prisma.generatedRecurringLineSetting.deleteMany({
        where: {
          familyId,
          source: "loans",
          sourceId: loanId,
        },
      });

      const updatedFamily = await prisma.family.findUniqueOrThrow({
        include: familyInclude,
        where: {
          id: familyId,
        },
      });

      return toFamilySnapshot(updatedFamily);
    });
  }

  async deleteLoanRepaymentLine(
    familyId: string,
    lineId: string,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.loanRepaymentLine.deleteMany({
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

  async deleteParticipationLine(
    familyId: string,
    lineId: string,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.participationLine.deleteMany({
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

  async deleteDistributionLine(
    familyId: string,
    lineId: string,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.distributionLine.deleteMany({
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
      await prisma.distributionMemberAmount.deleteMany({
        where: {
          distributionLine: {
            familyId,
          },
          memberId,
        },
      });
      await prisma.distributionLine.deleteMany({
        where: {
          familyId,
          memberAmounts: {
            none: {},
          },
        },
      });
      await prisma.generatedRecurringLineSetting.deleteMany({
        where: {
          familyId,
          source: {
            in: ["distribution", "participations"],
          },
          sourceId: memberId,
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
    return this.prisma.$transaction(async (prisma) => {
      await prisma.loanRepaymentLine.deleteMany({
        where: {
          familyId: family.id,
        },
      });
      await prisma.loan.deleteMany({
        where: {
          familyId: family.id,
        },
      });
      await prisma.distributionLine.deleteMany({
        where: {
          familyId: family.id,
        },
      });
      await prisma.participationLine.deleteMany({
        where: {
          familyId: family.id,
        },
      });
      await prisma.recurringLine.deleteMany({
        where: {
          familyId: family.id,
        },
      });

      await prisma.family.update({
        data: {
          categories: toJsonValue(family.categories),
          members: toJsonValue(family.members),
        },
        where: {
          id: family.id,
        },
      });

      for (const loan of family.loans) {
        await prisma.loan.create({
          data: {
            ...toLoanCreateInput(loan),
            familyId: family.id,
          },
        });
      }

      for (const line of family.distributionLines) {
        await prisma.distributionLine.create({
          data: {
            ...toDistributionLineCreateInput(line),
            familyId: family.id,
          },
        });
      }

      for (const line of family.loanRepaymentLines) {
        await prisma.loanRepaymentLine.create({
          data: {
            ...toLoanRepaymentLineCreateInput(line),
            familyId: family.id,
          },
        });
      }

      for (const line of family.recurringLines) {
        await prisma.recurringLine.create({
          data: {
            ...toRecurringLineCreateInput(line),
            familyId: family.id,
          },
        });
      }

      for (const line of family.participationLines) {
        await prisma.participationLine.create({
          data: {
            ...toParticipationLineCreateInput(line),
            familyId: family.id,
          },
        });
      }

      const updatedFamily = await prisma.family.findUniqueOrThrow({
        include: familyInclude,
        where: {
          id: family.id,
        },
      });

      return toFamilySnapshot(updatedFamily);
    });
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

  async updateParticipationLine(
    familyId: string,
    line: ParticipationLine,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.participationLine.updateMany({
      data: toParticipationLineUpdateInput(line),
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

  async updateDistributionLine(
    familyId: string,
    line: DistributionLine,
  ): Promise<FamilySnapshot | null> {
    return this.prisma.$transaction(async (prisma) => {
      const result = await prisma.distributionLine.updateMany({
        data: toDistributionLineUpdateInput(line),
        where: {
          familyId,
          id: line.id,
        },
      });

      if (result.count === 0) {
        return null;
      }

      await prisma.distributionMemberAmount.deleteMany({
        where: {
          distributionLineId: line.id,
        },
      });

      for (const memberAmount of line.memberAmounts) {
        await prisma.distributionMemberAmount.create({
          data: {
            amountCents: toCents(memberAmount.amount),
            distributionLineId: line.id,
            memberId: memberAmount.memberId,
          },
        });
      }

      const updatedFamily = await prisma.family.findUniqueOrThrow({
        include: familyInclude,
        where: {
          id: familyId,
        },
      });

      return toFamilySnapshot(updatedFamily);
    });
  }

  async updateGeneratedRecurringLineSetting(
    familyId: string,
    setting: GeneratedRecurringLineSetting,
  ): Promise<FamilySnapshot> {
    await this.prisma.generatedRecurringLineSetting.upsert({
      create: {
        ...toGeneratedRecurringLineSettingCreateInput(setting),
        familyId,
      },
      update: {
        isEnabled: setting.isEnabled,
      },
      where: {
        familyId_source_sourceId: {
          familyId,
          source: setting.source,
          sourceId: setting.sourceId,
        },
      },
    });

    return this.getFamilyById(familyId);
  }

  async updateLoan(
    familyId: string,
    loan: Loan,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.loan.updateMany({
      data: toLoanUpdateInput(loan),
      where: {
        familyId,
        id: loan.id,
      },
    });

    if (result.count === 0) {
      return null;
    }

    return this.getFamilyById(familyId);
  }

  async updateLoanRepaymentLine(
    familyId: string,
    line: LoanRepaymentLine,
  ): Promise<FamilySnapshot | null> {
    const result = await this.prisma.loanRepaymentLine.updateMany({
      data: toLoanRepaymentLineUpdateInput(line),
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
    distributionLines: family.distributionLines.map(toDistributionLine),
    generatedRecurringLineSettings: family.generatedRecurringLineSettings.map(
      toGeneratedRecurringLineSetting,
    ),
    id: family.id,
    loanRepaymentLines: family.loanRepaymentLines.map(toLoanRepaymentLine),
    loans: family.loans.map(toLoan),
    members: parseMembers(family.members),
    participationLines: family.participationLines.map(toParticipationLine),
    recurringLines: family.recurringLines.map(toRecurringLine),
  };
}

function toGeneratedRecurringLineSettingCreateInput(
  setting: GeneratedRecurringLineSetting,
) {
  return {
    isEnabled: setting.isEnabled,
    source: setting.source,
    sourceId: setting.sourceId,
  };
}

function toGeneratedRecurringLineSetting(
  setting: GeneratedRecurringLineSettingRecord,
): GeneratedRecurringLineSetting {
  return {
    isEnabled: setting.isEnabled,
    source: toGeneratedRecurringLineSource(setting.source),
    sourceId: setting.sourceId,
  };
}

function toGeneratedRecurringLineSource(
  source: string,
): GeneratedRecurringLineSource {
  if (
    source === "loans" ||
    source === "participations" ||
    source === "distribution"
  ) {
    return source;
  }

  throw new Error(`Generated recurring line source ${source} is invalid.`);
}

function toDistributionLineCreateInput(line: DistributionLine) {
  return {
    amountCents: toCents(line.amount),
    createdAt: new Date(line.createdAt),
    id: line.id,
    isExcludedFromStats: line.isExcludedFromStats,
    memberAmounts: {
      create: line.memberAmounts.map((memberAmount) => ({
        amountCents: toCents(memberAmount.amount),
        memberId: memberAmount.memberId,
      })),
    },
    month: line.month,
    year: line.year,
  };
}

function toDistributionLineUpdateInput(line: DistributionLine) {
  return {
    amountCents: toCents(line.amount),
    isExcludedFromStats: line.isExcludedFromStats,
    month: line.month,
    year: line.year,
  };
}

function toDistributionLine(line: DistributionLineRecord): DistributionLine {
  return {
    amount: fromCents(line.amountCents),
    createdAt: line.createdAt.toISOString(),
    id: line.id,
    isExcludedFromStats: line.isExcludedFromStats,
    memberAmounts: line.memberAmounts.map((memberAmount) => ({
      amount: fromCents(memberAmount.amountCents),
      memberId: memberAmount.memberId,
    })),
    month: line.month,
    year: line.year,
  };
}

function toLoanCreateInput(loan: Loan) {
  return {
    annualInterestRate: loan.annualInterestRate,
    createdAt: new Date(loan.createdAt),
    id: loan.id,
    initialAmountCents: toCents(loan.initialAmount),
    title: loan.title,
  };
}

function toLoanUpdateInput(loan: Loan) {
  return {
    annualInterestRate: loan.annualInterestRate,
    initialAmountCents: toCents(loan.initialAmount),
    title: loan.title,
  };
}

function toLoan(loan: LoanRecord): Loan {
  return {
    annualInterestRate: loan.annualInterestRate,
    createdAt: loan.createdAt.toISOString(),
    id: loan.id,
    initialAmount: fromCents(loan.initialAmountCents),
    title: loan.title,
  };
}

function toLoanRepaymentLineCreateInput(line: LoanRepaymentLine) {
  return {
    createdAt: new Date(line.createdAt),
    feesCents: toCents(line.feesAmount),
    id: line.id,
    isExcludedFromStats: line.isExcludedFromStats,
    loanId: line.loanId,
    month: line.month,
    paidCents: toCents(line.paidAmount),
    year: line.year,
  };
}

function toLoanRepaymentLineUpdateInput(line: LoanRepaymentLine) {
  return {
    feesCents: toCents(line.feesAmount),
    isExcludedFromStats: line.isExcludedFromStats,
    loanId: line.loanId,
    month: line.month,
    paidCents: toCents(line.paidAmount),
    year: line.year,
  };
}

function toLoanRepaymentLine(line: LoanRepaymentLineRecord): LoanRepaymentLine {
  return {
    createdAt: line.createdAt.toISOString(),
    feesAmount: fromCents(line.feesCents),
    id: line.id,
    isExcludedFromStats: line.isExcludedFromStats,
    loanId: line.loanId,
    month: line.month,
    paidAmount: fromCents(line.paidCents),
    year: line.year,
  };
}

function toParticipationLineCreateInput(line: ParticipationLine) {
  return {
    amountCents: toCents(line.amount),
    createdAt: new Date(line.createdAt),
    id: line.id,
    isExcludedFromStats: line.isExcludedFromStats,
    memberId: line.memberId,
    month: line.month,
    title: line.title ?? null,
    year: line.year,
  };
}

function toParticipationLineUpdateInput(line: ParticipationLine) {
  return {
    amountCents: toCents(line.amount),
    isExcludedFromStats: line.isExcludedFromStats,
    memberId: line.memberId,
    month: line.month,
    title: line.title ?? null,
    year: line.year,
  };
}

function toParticipationLine(line: ParticipationLineRecord): ParticipationLine {
  return {
    amount: fromCents(line.amountCents),
    createdAt: line.createdAt.toISOString(),
    id: line.id,
    isExcludedFromStats: line.isExcludedFromStats,
    memberId: line.memberId,
    month: line.month,
    title: line.title ?? undefined,
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
    const isActive = member.isActive;

    if (typeof id !== "string" || typeof name !== "string") {
      return [];
    }

    return [
      {
        id,
        isActive: typeof isActive === "boolean" ? isActive : true,
        name,
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
