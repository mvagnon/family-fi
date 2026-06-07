import { useMemo } from "react";
import Box from "@mui/material/Box";
import { MetricSummaryCard } from "@repo/ui/metric-summary-card";
import { useTranslation } from "react-i18next";

import type { FamilyLoanSummary } from "../domain/family-loans";
import { FamilyYearSelectorCard } from "./family-year-selector-card";
import { useFamilyFormat } from "./use-family-format";

interface FamilyLoansTopProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  summary: FamilyLoanSummary;
  year: number;
}

export function FamilyLoansTop({
  currentYear,
  onYearChange,
  summary,
  year,
}: FamilyLoansTopProps) {
  const { i18n, t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const projectionFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        month: "long",
        year: "numeric",
      }),
    [i18n.language, i18n.resolvedLanguage],
  );
  const projectionValue =
    summary.loanCount === 0
      ? t("loans.metrics.unavailableProjection")
      : summary.remainingAmount <= 0
        ? t("loans.metrics.paidOff")
        : summary.projectionDate
          ? projectionFormatter.format(summary.projectionDate)
          : t("loans.metrics.unavailableProjection");

  return (
    <Box
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          md: "max-content minmax(0, 1fr)",
          xs: "minmax(0, 1fr)",
        },
      }}
    >
      <FamilyYearSelectorCard
        currentYear={currentYear}
        label={t("loans.top.selection")}
        nextLabel={t("loans.top.nextYear")}
        onYearChange={onYearChange}
        previousLabel={t("loans.top.previousYear")}
        year={year}
        yearAriaLabel={t("loans.top.yearAriaLabel")}
      />

      <MetricSummaryCard
        label={t("loans.top.keyFigures")}
        metrics={[
          {
            label: t("loans.metrics.paidAmount"),
            value: familyFormat.formatCurrency(summary.paidAmount),
            valueTone: summary.paidAmount > 0 ? "positive" : undefined,
          },
          {
            label: t("loans.metrics.feesAmount"),
            value: familyFormat.formatCurrency(summary.feesAmount),
            valueTone: summary.feesAmount > 0 ? "negative" : undefined,
          },
          {
            label: t("loans.metrics.projection"),
            value: projectionValue,
          },
        ]}
      />
    </Box>
  );
}
