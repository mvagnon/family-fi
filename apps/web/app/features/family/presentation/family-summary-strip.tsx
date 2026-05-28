import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

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
