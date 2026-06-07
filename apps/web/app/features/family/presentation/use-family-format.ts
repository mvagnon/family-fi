import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useActiveSpace } from "../../spaces/presentation/active-space-provider";
import { defaultSpaceCurrency } from "../../spaces/domain/spaces";
import type { RecurringLine } from "../domain/family";
import {
  formatAmountRange,
  formatCurrency,
  formatCurrencySymbol,
  formatLineAmount,
  formatRecurrence,
} from "./family-format";

export function useFamilyFormat() {
  const { i18n, t } = useTranslation();
  const { activeSpace } = useActiveSpace();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const currencyCode = activeSpace?.currencyCode ?? defaultSpaceCurrency;

  return useMemo(
    () => ({
      formatAmountRange: (minAmount: number, maxAmount: number) =>
        formatAmountRange(minAmount, maxAmount, locale, t, currencyCode),
      formatCurrency: (value: number) =>
        formatCurrency(value, locale, currencyCode),
      formatLineAmount: (line: RecurringLine) =>
        formatLineAmount(line, locale, t, currencyCode),
      formatRecurrence: (months: number) => formatRecurrence(months, t),
      currencyCode,
      currencySymbol: formatCurrencySymbol(locale, currencyCode),
    }),
    [currencyCode, locale, t],
  );
}
