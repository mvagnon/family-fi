import type { TFunction } from "i18next";

import type { SupportedCurrency } from "../../spaces/domain/spaces";
import type { RecurringLine } from "../domain/family";

export function formatCurrency(
  value: number,
  locale: string,
  currencyCode: SupportedCurrency,
): string {
  return getCurrencyFormatter(locale, currencyCode).format(value);
}

export function formatLineAmount(
  line: RecurringLine,
  locale: string,
  t: TFunction,
  currencyCode: SupportedCurrency,
): string {
  if (!line.isEstimate) {
    return formatCurrency(
      getSignedAmount(line, line.amount),
      locale,
      currencyCode,
    );
  }

  const minAmount = getSignedAmount(line, line.minAmount ?? line.amount);
  const maxAmount = getSignedAmount(line, line.maxAmount ?? line.amount);

  return formatAmountRange(
    Math.min(minAmount, maxAmount),
    Math.max(minAmount, maxAmount),
    locale,
    t,
    currencyCode,
  );
}

export function formatAmountRange(
  minAmount: number,
  maxAmount: number,
  locale: string,
  t: TFunction,
  currencyCode: SupportedCurrency,
): string {
  return t("family.format.amountRange", {
    max: formatCurrency(maxAmount, locale, currencyCode),
    min: formatCurrency(minAmount, locale, currencyCode),
  });
}

export function formatCurrencySymbol(
  locale: string,
  currencyCode: SupportedCurrency,
): string {
  const currencyPart = getCurrencyFormatter(locale, currencyCode)
    .formatToParts(0)
    .find((part) => part.type === "currency");

  return currencyPart?.value ?? currencyCode;
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

function getCurrencyFormatter(
  locale: string,
  currencyCode: SupportedCurrency,
): Intl.NumberFormat {
  const formatterLocale = getFormatterLocale(locale);
  const formatterKey = `${formatterLocale}:${currencyCode}`;
  const formatter = currencyFormatters.get(formatterKey);

  if (formatter) {
    return formatter;
  }

  const nextFormatter = new Intl.NumberFormat(formatterLocale, {
    currency: currencyCode,
    maximumFractionDigits: 0,
    style: "currency",
  });

  currencyFormatters.set(formatterKey, nextFormatter);

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
