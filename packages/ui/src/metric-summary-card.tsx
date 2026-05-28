import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

export interface MetricSummaryItem {
  label: ReactNode;
  value: ReactNode;
}

interface MetricSummaryCardProps {
  component?: ElementType;
  label: ReactNode;
  metrics: MetricSummaryItem[];
  sx?: SxProps<Theme>;
}

export function MetricSummaryCard({
  component = "section",
  label,
  metrics,
  sx,
}: MetricSummaryCardProps) {
  return (
    <Paper
      component={component}
      sx={[
        {
          bgcolor: "background.paper",
          p: { md: 2.25, xs: 1.75 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Typography color="text.secondary" variant="overline">
        {label}
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
        {metrics.map((metric, index) => (
          <Box key={index}>
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
              {metric.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
