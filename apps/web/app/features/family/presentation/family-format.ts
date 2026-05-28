import type { RecurringLine } from "../domain/family";

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatLineAmount(line: RecurringLine): string {
  if (!line.isEstimate) {
    return formatCurrency(getSignedAmount(line, line.amount));
  }

  const minAmount = getSignedAmount(line, line.minAmount ?? line.amount);
  const maxAmount = getSignedAmount(line, line.maxAmount ?? line.amount);

  return `${formatCurrency(Math.min(minAmount, maxAmount))} à ${formatCurrency(
    Math.max(minAmount, maxAmount),
  )}`;
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

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency",
});

function getSignedAmount(line: RecurringLine, amount: number): number {
  return line.movement === "positive" ? amount : -amount;
}
