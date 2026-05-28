import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { formatCurrency, getMonthlyValue } from "./preview-format";
import type { RecurringLine } from "./types";

interface FamilySummaryStripProps {
  lines: RecurringLine[];
}

export function FamilySummaryStrip({ lines }: FamilySummaryStripProps) {
  const monthlyTotals = getPeriodTotals(lines);
  const annualTotals = {
    avg: monthlyTotals.avg * 12,
    max: monthlyTotals.max * 12,
    min: monthlyTotals.min * 12,
  };

  const summaryCards = [
    { label: "Mensuel", totals: monthlyTotals },
    { label: "Annuel", totals: annualTotals },
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
        <Paper
          component="section"
          key={item.label}
          sx={{
            bgcolor: "background.paper",
            p: { md: 2.25, xs: 1.75 },
          }}
        >
          <Typography color="text.secondary" variant="overline">
            {item.label}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                sm: "repeat(3, minmax(0, 1fr))",
                xs: "minmax(0, 1fr)",
              },
              mt: 1,
            }}
          >
            {[
              { label: "Min.", value: item.totals.min },
              { label: "Max.", value: item.totals.max },
              { label: "Moy.", value: item.totals.avg },
            ].map((metric) => (
              <Box key={metric.label}>
                <Typography color="text.secondary" variant="body2">
                  {metric.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Fraunces Variable", "Fraunces", serif',
                    fontSize: { md: "1.7rem", xs: "1.45rem" },
                    fontWeight: 760,
                    lineHeight: 1,
                    mt: 0.5,
                  }}
                >
                  {formatCurrency(metric.value)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

interface PeriodTotals {
  avg: number;
  max: number;
  min: number;
}

function getPeriodTotals(lines: RecurringLine[]): PeriodTotals {
  return lines.reduce(
    (summary, line) => {
      const minAmount = line.isEstimate
        ? (line.minAmount ?? line.amount)
        : line.amount;
      const maxAmount = line.isEstimate
        ? (line.maxAmount ?? line.amount)
        : line.amount;
      const minMonthlyValue = getMonthlyValue(line, minAmount);
      const maxMonthlyValue = getMonthlyValue(line, maxAmount);

      return {
        avg: summary.avg + (minMonthlyValue + maxMonthlyValue) / 2,
        max: summary.max + Math.max(minMonthlyValue, maxMonthlyValue),
        min: summary.min + Math.min(minMonthlyValue, maxMonthlyValue),
      };
    },
    { avg: 0, max: 0, min: 0 },
  );
}
