import type { TFunction } from "i18next";

import type { RecurringLine } from "../domain/family";

export function formatCurrency(value: number, locale: string): string {
  return getCurrencyFormatter(locale).format(value);
}

export function formatLineAmount(
  line: RecurringLine,
  locale: string,
  t: TFunction,
): string {
  if (!line.isEstimate) {
    return formatCurrency(getSignedAmount(line, line.amount), locale);
  }

  const minAmount = getSignedAmount(line, line.minAmount ?? line.amount);
  const maxAmount = getSignedAmount(line, line.maxAmount ?? line.amount);

  return formatAmountRange(
    Math.min(minAmount, maxAmount),
    Math.max(minAmount, maxAmount),
    locale,
    t,
  );
}

export function formatAmountRange(
  minAmount: number,
  maxAmount: number,
  locale: string,
  t: TFunction,
): string {
  return t("family.format.amountRange", {
    max: formatCurrency(maxAmount, locale),
    min: formatCurrency(minAmount, locale),
  });
}

export function formatRecurrence(months: number, t: TFunction): string {
  if (months === 1) {
    return t("family.format.recurrence.monthly");
  }

  if (months === 12) {
    return t("family.format.recurrence.yearly");
  }

  return t("family.format.recurrence.everyMonths", { count: months });
}

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getSignedAmount(line: RecurringLine, amount: number): number {
  return line.movement === "positive" ? amount : -amount;
}

function getCurrencyFormatter(locale: string): Intl.NumberFormat {
  const formatterLocale = getFormatterLocale(locale);
  const formatter = currencyFormatters.get(formatterLocale);

  if (formatter) {
    return formatter;
  }

  const nextFormatter = new Intl.NumberFormat(formatterLocale, {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  });

  currencyFormatters.set(formatterLocale, nextFormatter);

  return nextFormatter;
}

function getFormatterLocale(locale: string): string {
  const language = locale.split("-")[0];

  if (language === "fr") {
    return "fr-FR";
  }

  if (language === "ja") {
    return "ja-JP";
  }

  return "en-US";
}
