import Box from "@mui/material/Box";
import { MetricSummaryCard } from "@repo/ui/metric-summary-card";
import { useTranslation } from "react-i18next";

import {
  getActiveBudgetRecurringLines,
  getFamilyBudgetSummary,
  type FamilyBudgetLine,
} from "../domain/family-budget";
import { useFamilyFormat } from "./use-family-format";

interface FamilySummaryStripProps {
  lines: FamilyBudgetLine[];
}

export function FamilySummaryStrip({ lines }: FamilySummaryStripProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const summary = getFamilyBudgetSummary(getActiveBudgetRecurringLines(lines));
  const summaryCards = [
    { label: t("family.summary.monthly"), totals: summary.monthly },
    { label: t("family.summary.annual"), totals: summary.annual },
  ];

  return (
    <Box
      aria-label={t("family.summary.ariaLabel")}
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          md: "repeat(2, minmax(0, 1fr))",
          xs: "minmax(0, 1fr)",
        },
      }}
    >
      {summaryCards.map((item) => (
        <MetricSummaryCard
          key={item.label}
          label={item.label}
          metrics={[
            { label: t("family.summary.min"), value: item.totals.min },
            { label: t("family.summary.max"), value: item.totals.max },
            { label: t("family.summary.avg"), value: item.totals.avg },
          ].map((metric) => ({
            label: metric.label,
            value: familyFormat.formatCurrency(metric.value),
            valueTone: getSummaryValueTone(metric.value),
          }))}
        />
      ))}
    </Box>
  );
}

function getSummaryValueTone(value: number) {
  if (value > 0) {
    return "positive";
  }

  if (value < 0) {
    return "negative";
  }

  return undefined;
}
