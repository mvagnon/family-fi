import type { FamilyCategory, RecurringLine } from "./family";
import {
  isGeneratedRecurringLineCategoryId,
  type GeneratedFamilyBudgetLine,
} from "./family-generated-recurring-lines";

export interface ManualFamilyBudgetLine {
  kind: "manual";
  line: RecurringLine;
}

export type FamilyBudgetLine =
  | ManualFamilyBudgetLine
  | GeneratedFamilyBudgetLine;

export interface FamilyCategoryGroup {
  id: string;
  isGenerated?: boolean;
  label: string;
  lines: FamilyBudgetLine[];
}

export interface PeriodTotals {
  avg: number;
  max: number;
  min: number;
}

export interface FamilyBudgetSummary {
  annual: PeriodTotals;
  monthly: PeriodTotals;
}

export function getCategoryGroups(
  categories: FamilyCategory[],
  lines: FamilyBudgetLine[],
): FamilyCategoryGroup[] {
  const linesByCategory = new Map<string, FamilyBudgetLine[]>();

  for (const line of lines) {
    const categoryId = line.line.categoryId;
    const categoryLines = linesByCategory.get(categoryId) ?? [];
    categoryLines.push(line);
    linesByCategory.set(categoryId, categoryLines);
  }

  const knownCategoryIds = new Set(categories.map((category) => category.id));
  const knownGroups = categories.flatMap((category) => {
    const categoryLines = linesByCategory.get(category.id);

    if (!categoryLines?.length) {
      return [];
    }

    return [
      {
        id: category.id,
        label: category.label,
        lines: categoryLines,
      },
    ];
  });
  const orphanGroups = Array.from(linesByCategory.entries()).flatMap(
    ([categoryId, categoryLines]) => {
      if (knownCategoryIds.has(categoryId)) {
        return [];
      }

      return [
        {
          id: categoryId,
          isGenerated: isGeneratedRecurringLineCategoryId(categoryId),
          label: categoryId,
          lines: categoryLines,
        },
      ];
    },
  );

  return [...knownGroups, ...orphanGroups];
}

export function getFamilyBudgetSummary(
  lines: RecurringLine[],
): FamilyBudgetSummary {
  const monthly = getPeriodTotals(lines);

  return {
    annual: multiplyTotals(monthly, 12),
    monthly,
  };
}

export function toManualFamilyBudgetLines(
  lines: RecurringLine[],
): FamilyBudgetLine[] {
  return lines.map((line) => ({
    kind: "manual",
    line,
  }));
}

export function getActiveBudgetRecurringLines(
  lines: FamilyBudgetLine[],
): RecurringLine[] {
  return lines.flatMap((line) =>
    line.kind === "manual" || line.isEnabled ? [line.line] : [],
  );
}

export function getPeriodTotals(lines: RecurringLine[]): PeriodTotals {
  return lines.reduce(
    (summary, line) => {
      const range = getMonthlyRange(line);

      return {
        avg: summary.avg + range.avg,
        max: summary.max + range.max,
        min: summary.min + range.min,
      };
    },
    { avg: 0, max: 0, min: 0 },
  );
}

export function getMonthlyRange(line: RecurringLine): PeriodTotals {
  const minAmount = line.isEstimate
    ? (line.minAmount ?? line.amount)
    : line.amount;
  const maxAmount = line.isEstimate
    ? (line.maxAmount ?? line.amount)
    : line.amount;
  const minMonthlyValue = getMonthlyValue(line, minAmount);
  const maxMonthlyValue = getMonthlyValue(line, maxAmount);
  const min = Math.min(minMonthlyValue, maxMonthlyValue);
  const max = Math.max(minMonthlyValue, maxMonthlyValue);

  return {
    avg: (min + max) / 2,
    max,
    min,
  };
}

export function getMonthlyValue(line: RecurringLine, value: number): number {
  const signedValue = line.movement === "positive" ? value : -value;

  return signedValue / line.recurrenceMonths;
}

function multiplyTotals(
  totals: PeriodTotals,
  multiplier: number,
): PeriodTotals {
  return {
    avg: totals.avg * multiplier,
    max: totals.max * multiplier,
    min: totals.min * multiplier,
  };
}
