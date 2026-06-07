import Box from "@mui/material/Box";
import { MetricSummaryCard } from "@repo/ui/metric-summary-card";
import { useTranslation } from "react-i18next";

import type { FamilyParticipationSummary } from "../domain/family-participations";
import { useFamilyFormat } from "./use-family-format";
import { FamilyYearSelectorCard } from "./family-year-selector-card";

interface FamilyParticipationsTopProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  summary: FamilyParticipationSummary;
  year: number;
}

export function FamilyParticipationsTop({
  currentYear,
  onYearChange,
  summary,
  year,
}: FamilyParticipationsTopProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();

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
        label={t("participations.top.selection")}
        nextLabel={t("participations.top.nextYear")}
        onYearChange={onYearChange}
        previousLabel={t("participations.top.previousYear")}
        year={year}
        yearAriaLabel={t("participations.top.yearAriaLabel")}
      />

      <MetricSummaryCard
        label={t("participations.top.keyFigures")}
        metrics={[
          {
            label: t("participations.metrics.expenses"),
            value: familyFormat.formatCurrency(summary.expenses),
          },
          {
            label: t("participations.metrics.income"),
            value: familyFormat.formatCurrency(summary.income),
            valueTone: summary.income > 0 ? "positive" : undefined,
          },
          {
            label: t("participations.metrics.difference"),
            value: familyFormat.formatCurrency(summary.difference),
            valueTone:
              summary.difference > 0
                ? "positive"
                : summary.difference < 0
                  ? "negative"
                  : undefined,
          },
        ]}
      />
    </Box>
  );
}
