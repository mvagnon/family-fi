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

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency",
});
