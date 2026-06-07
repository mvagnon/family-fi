const monthIndexes = Array.from({ length: 12 }, (_, index) => index);

interface VisibleMonthIndexesInput {
  currentMonthIndex: number;
  currentYear: number;
  year: number;
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
