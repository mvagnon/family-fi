import { roundCurrency } from "./family-finance-calculations";
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

const generatedLineCategoryId = "generated-recurring-lines";

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
  return generatedLineCategoryId;
}

export function isGeneratedRecurringLineCategoryId(
  categoryId: string,
): boolean {
  return categoryId === generatedLineCategoryId;
}

function getLoanGeneratedRecurringLines(
  family: Family,
): GeneratedFamilyBudgetLine[] {
  return family.loans.flatMap((loan) => {
    const monthlyTotals = getMonthlyTotals(
      family.loanRepaymentLines
        .filter((line) => line.loanId === loan.id)
        .map((line) => ({
          amount: line.paidAmount,
          month: line.month,
          year: line.year,
        })),
    );
    const averageAmount = getAverageNonZeroMonthlyTotal(monthlyTotals);

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
    const monthlyTotals = getMonthlyTotals(
      family.participationLines
        .filter((line) => line.memberId === member.id)
        .map((line) => ({
          amount: line.amount,
          month: line.month,
          year: line.year,
        })),
    );
    const averageAmount = getAverageNonZeroMonthlyTotal(monthlyTotals);

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
    const monthlyTotals = getMonthlyTotals(
      family.distributionLines.flatMap((line) =>
        line.memberAmounts
          .filter((memberAmount) => memberAmount.memberId === member.id)
          .map((memberAmount) => ({
            amount: memberAmount.amount,
            month: line.month,
            year: line.year,
          })),
      ),
    );
    const averageAmount = getAverageNonZeroMonthlyTotal(monthlyTotals);

    if (averageAmount <= 0) {
      return [];
    }

    return [
      createGeneratedFamilyBudgetLine(family, {
        amount: averageAmount,
        movement: "positive",
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

function getMonthlyTotals(
  lines: { amount: number; month: number; year: number }[],
): number[] {
  const totalsByMonth = new Map<string, number>();

  for (const line of lines) {
    const key = `${line.year}-${String(line.month).padStart(2, "0")}`;
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + line.amount);
  }

  return [...totalsByMonth.values()].map(roundCurrency);
}

function getAverageNonZeroMonthlyTotal(monthlyTotals: number[]): number {
  const nonZeroTotals = monthlyTotals.filter((total) => total !== 0);

  if (nonZeroTotals.length === 0) {
    return 0;
  }

  return roundCurrency(
    nonZeroTotals.reduce((total, value) => total + value, 0) /
      nonZeroTotals.length,
  );
}
