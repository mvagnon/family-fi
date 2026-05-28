import type { RecurringLine } from "./types";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatRecurrence(months: number): string {
  if (months === 1) {
    return "Chaque mois";
  }

  if (months === 12) {
    return "Chaque année";
  }

  return `Tous les ${months} mois`;
}

export function getMonthlyValue(line: RecurringLine, value: number): number {
  const signedValue = line.movement === "positive" ? value : -value;

  return signedValue / line.recurrenceMonths;
}
