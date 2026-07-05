import { getAverageMonthlyAmountTotal } from "./family-finance-calculations";
import type {
  Family,
  GeneratedRecurringLineSource,
  RecurringLine,
} from "./family";

export interface GeneratedFamilyBudgetLine {
  isEnabled: boolean;
  kind: "generated";
  line: RecurringLine;
  source: GeneratedRecurringLineSource;
  sourceId: string;
}

export const generatedRecurringLineCategoryId = "generated-recurring-lines";

export function getGeneratedRecurringLines(
  family: Family,
): GeneratedFamilyBudgetLine[] {
  return [
    ...getLoanGeneratedRecurringLines(family),
    ...getParticipationGeneratedRecurringLines(family),
    ...getDistributionGeneratedRecurringLines(family),
  ];
}

export function getGeneratedRecurringLineCategoryId(
  _source: GeneratedRecurringLineSource,
): string {
  return generatedRecurringLineCategoryId;
}

export function isGeneratedRecurringLineCategoryId(
  categoryId: string,
): boolean {
  return categoryId === generatedRecurringLineCategoryId;
}

function getLoanGeneratedRecurringLines(
  family: Family,
): GeneratedFamilyBudgetLine[] {
  return family.loans.flatMap((loan) => {
    const averageAmount = getAverageMonthlyAmountTotal(
      family.loanRepaymentLines
        .filter((line) => line.loanId === loan.id && !line.isExcludedFromStats)
        .map((line) => ({
          amount: line.paidAmount,
          month: line.month,
          year: line.year,
        })),
    );

    if (averageAmount <= 0) {
      return [];
    }

    return [
      createGeneratedFamilyBudgetLine(family, {
        amount: averageAmount,
        movement: "negative",
        source: "loans",
        sourceId: loan.id,
        title: loan.title,
      }),
    ];
  });
}

function getParticipationGeneratedRecurringLines(
  family: Family,
): GeneratedFamilyBudgetLine[] {
  return family.members.flatMap((member) => {
    const averageAmount = getAverageMonthlyAmountTotal(
      family.participationLines
        .filter(
          (line) => line.memberId === member.id && !line.isExcludedFromStats,
        )
        .map((line) => ({
          amount: line.amount,
          month: line.month,
          year: line.year,
        })),
    );

    if (averageAmount === 0) {
      return [];
    }

    return [
      createGeneratedFamilyBudgetLine(family, {
        amount: Math.abs(averageAmount),
        movement: averageAmount > 0 ? "positive" : "negative",
        source: "participations",
        sourceId: member.id,
        title: member.name,
      }),
    ];
  });
}

function getDistributionGeneratedRecurringLines(
  family: Family,
): GeneratedFamilyBudgetLine[] {
  return family.members.flatMap((member) => {
    const averageAmount = getAverageMonthlyAmountTotal(
      family.distributionLines
        .filter((line) => !line.isExcludedFromStats)
        .flatMap((line) =>
          line.memberAmounts
            .filter((memberAmount) => memberAmount.memberId === member.id)
            .map((memberAmount) => ({
              amount: memberAmount.amount,
              month: line.month,
              year: line.year,
            })),
        ),
    );

    if (averageAmount === 0) {
      return [];
    }

    return [
      createGeneratedFamilyBudgetLine(family, {
        amount: Math.abs(averageAmount),
        movement: averageAmount > 0 ? "negative" : "positive",
        source: "distribution",
        sourceId: member.id,
        title: member.name,
      }),
    ];
  });
}

function createGeneratedFamilyBudgetLine(
  family: Family,
  input: {
    amount: number;
    movement: RecurringLine["movement"];
    source: GeneratedRecurringLineSource;
    sourceId: string;
    title: string;
  },
): GeneratedFamilyBudgetLine {
  const setting = family.generatedRecurringLineSettings.find(
    (item) => item.source === input.source && item.sourceId === input.sourceId,
  );

  return {
    isEnabled: setting?.isEnabled ?? true,
    kind: "generated",
    line: {
      amount: input.amount,
      categoryId: getGeneratedRecurringLineCategoryId(input.source),
      description: "",
      id: getGeneratedRecurringLineId(input.source, input.sourceId),
      isEstimate: false,
      movement: input.movement,
      recurrenceMonths: 1,
      title: input.title,
    },
    source: input.source,
    sourceId: input.sourceId,
  };
}

function getGeneratedRecurringLineId(
  source: GeneratedRecurringLineSource,
  sourceId: string,
): string {
  return `generated:${source}:${sourceId}`;
}
