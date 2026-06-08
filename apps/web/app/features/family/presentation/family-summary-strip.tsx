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
    {
      id: "monthly",
      label: t("family.summary.monthly"),
      metrics: [
        { label: t("family.summary.min"), value: summary.monthly.min },
        { label: t("family.summary.max"), value: summary.monthly.max },
        { label: t("family.summary.avg"), value: summary.monthly.avg },
      ],
    },
    {
      id: "average",
      metrics: [
        {
          label: t("family.summary.annualAverage"),
          value: summary.annual.avg,
        },
      ],
    },
  ];

  return (
    <Box
      aria-label={t("family.summary.ariaLabel")}
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          md: "minmax(0, 1fr) max-content",
          xs: "minmax(0, 1fr)",
        },
      }}
    >
      {summaryCards.map((item) => (
        <MetricSummaryCard
          key={item.id}
          label={item.label}
          metrics={item.metrics.map((metric) => ({
            label: metric.label,
            value: familyFormat.formatCurrency(metric.value),
            valueTone: getSummaryValueTone(metric.value),
          }))}
          sx={
            item.id === "average"
              ? {
                  alignContent: "center",
                  display: "grid",
                  minWidth: { md: 220 },
                }
              : undefined
          }
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
