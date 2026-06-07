import Box from "@mui/material/Box";
import { MetricSummaryCard } from "@repo/ui/metric-summary-card";
import { useTranslation } from "react-i18next";

import type { FamilyDistributionSummary } from "../domain/family-distributions";
import { FamilyYearSelectorCard } from "./family-year-selector-card";
import { useFamilyFormat } from "./use-family-format";

interface FamilyDistributionsTopProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  summary: FamilyDistributionSummary;
  year: number;
}

export function FamilyDistributionsTop({
  currentYear,
  onYearChange,
  summary,
  year,
}: FamilyDistributionsTopProps) {
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
        label={t("distributions.top.selection")}
        nextLabel={t("distributions.top.nextYear")}
        onYearChange={onYearChange}
        previousLabel={t("distributions.top.previousYear")}
        year={year}
        yearAriaLabel={t("distributions.top.yearAriaLabel")}
      />

      <MetricSummaryCard
        label={t("distributions.top.keyFigures")}
        metrics={[
          {
            label: t("distributions.metrics.averageSalary"),
            value: familyFormat.formatCurrency(summary.averageSalary),
          },
          {
            label: t("distributions.metrics.maxSalary"),
            value: familyFormat.formatCurrency(summary.maxSalary),
          },
          {
            label: t("distributions.metrics.minSalary"),
            value: familyFormat.formatCurrency(summary.minSalary),
          },
        ]}
      />
    </Box>
  );
}
