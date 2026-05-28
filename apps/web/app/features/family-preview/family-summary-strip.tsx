import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { formatCurrency, getMonthlyValue } from "./preview-format";
import type { RecurringLine } from "./types";

interface FamilySummaryStripProps {
  lines: RecurringLine[];
}

export function FamilySummaryStrip({ lines }: FamilySummaryStripProps) {
  const totals = lines.reduce(
    (summary, line) => {
      const minAmount = line.isEstimate
        ? (line.minAmount ?? line.amount)
        : line.amount;
      const maxAmount = line.isEstimate
        ? (line.maxAmount ?? line.amount)
        : line.amount;

      return {
        max: summary.max + getMonthlyValue(line, maxAmount),
        min: summary.min + getMonthlyValue(line, minAmount),
      };
    },
    { max: 0, min: 0 },
  );

  const summaryItems = [
    { label: "Mensuel min.", value: formatCurrency(totals.min) },
    { label: "Mensuel max.", value: formatCurrency(totals.max) },
    { label: "Lignes", value: String(lines.length) },
  ];

  return (
    <Box
      aria-label="Résumé mensuel du foyer"
      sx={{
        display: "grid",
        gap: 1.5,
        gridTemplateColumns: {
          xs: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
        },
      }}
    >
      {summaryItems.map((item) => (
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
          <Typography
            sx={{
              fontFamily: '"Fraunces Variable", "Fraunces", serif',
              fontSize: { md: "2rem", xs: "1.55rem" },
              fontWeight: 760,
              lineHeight: 1,
              mt: 0.75,
            }}
          >
            {item.value}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
