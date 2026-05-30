import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { RecurringLine } from "../domain/family";
import {
  formatAmountRange,
  formatCurrency,
  formatLineAmount,
  formatRecurrence,
} from "./family-format";

export function useFamilyFormat() {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;

  return useMemo(
    () => ({
      formatAmountRange: (minAmount: number, maxAmount: number) =>
        formatAmountRange(minAmount, maxAmount, locale, t),
      formatCurrency: (value: number) => formatCurrency(value, locale),
      formatLineAmount: (line: RecurringLine) =>
        formatLineAmount(line, locale, t),
      formatRecurrence: (months: number) => formatRecurrence(months, t),
    }),
    [locale, t],
  );
}
