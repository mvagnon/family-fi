const monthIndexes = Array.from({ length: 12 }, (_, index) => index);

interface VisibleMonthIndexesInput {
  currentMonthIndex: number;
  currentYear: number;
  year: number;
}

export interface MonthlyAmountLine {
  amount: number;
  month: number;
  year: number;
}

interface AverageMonthlyAmountTotalOptions {
  includeTotal?: (total: number) => boolean;
  roundAverage?: boolean;
}

export function getVisibleMonthIndexes(
  input: VisibleMonthIndexesInput,
): number[] {
  if (input.year > input.currentYear) {
    return [];
  }

  if (input.year === input.currentYear) {
    return monthIndexes.filter(
      (monthIndex) => monthIndex <= input.currentMonthIndex,
    );
  }

  return monthIndexes;
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function getMonthlyAmountTotals(lines: MonthlyAmountLine[]): number[] {
  const totalsByMonth = new Map<string, number>();

  for (const line of lines) {
    const key = `${line.year}-${String(line.month).padStart(2, "0")}`;
    totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + line.amount);
  }

  return [...totalsByMonth.values()].map(roundCurrency);
}

export function getAverageMonthlyAmountTotal(
  lines: MonthlyAmountLine[],
  options: AverageMonthlyAmountTotalOptions = {},
): number {
  const includeTotal = options.includeTotal ?? ((total: number) => total !== 0);
  const monthlyTotals = getMonthlyAmountTotals(lines).filter(includeTotal);

  if (monthlyTotals.length === 0) {
    return 0;
  }

  const average =
    monthlyTotals.reduce((total, value) => total + value, 0) /
    monthlyTotals.length;

  return options.roundAverage === false ? average : roundCurrency(average);
}
