import Box from "@mui/material/Box";
import { MetricSummaryCard } from "@repo/ui/metric-summary-card";

import { getFamilyBudgetSummary } from "../domain/family-budget";
import type { RecurringLine } from "../domain/family";
import { formatCurrency } from "./family-format";

interface FamilySummaryStripProps {
  lines: RecurringLine[];
}

export function FamilySummaryStrip({ lines }: FamilySummaryStripProps) {
  const summary = getFamilyBudgetSummary(lines);
  const summaryCards = [
    { label: "Mensuel", totals: summary.monthly },
    { label: "Annuel", totals: summary.annual },
  ];

  return (
    <Box
      aria-label="Résumé du foyer"
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
            { label: "Min.", value: item.totals.min },
            { label: "Max.", value: item.totals.max },
            { label: "Moy.", value: item.totals.avg },
          ].map((metric) => ({
            label: metric.label,
            value: formatCurrency(metric.value),
          }))}
        />
      ))}
    </Box>
  );
}
