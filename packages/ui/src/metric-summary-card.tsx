import type { ElementType, ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

export interface MetricSummaryItem {
  label: ReactNode;
  value: ReactNode;
  valueTone?: "negative" | "positive";
}

interface MetricSummaryCardProps {
  action?: ReactNode;
  component?: ElementType;
  label?: ReactNode;
  metrics: MetricSummaryItem[];
  sx?: SxProps<Theme>;
}

export function MetricSummaryCard({
  action,
  component = "section",
  label,
  metrics,
  sx,
}: MetricSummaryCardProps) {
  const metricColumnCount = Math.min(Math.max(metrics.length, 1), 3);

  return (
    <Paper
      component={component}
      sx={[
        {
          bgcolor: "background.paper",
          p: { md: 2.5, xs: 2 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {label || action ? (
        <Box
          sx={{
            alignItems: { sm: "flex-start", xs: "stretch" },
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              sm:
                label && action
                  ? "minmax(0, 1fr) minmax(220px, 320px)"
                  : "minmax(0, 1fr)",
              xs: "minmax(0, 1fr)",
            },
          }}
        >
          {label ? (
            <Typography color="text.secondary" variant="overline">
              {label}
            </Typography>
          ) : null}
          {action ? (
            <Box sx={{ maxWidth: { sm: 320, xs: "none" }, width: "100%" }}>
              {action}
            </Box>
          ) : null}
        </Box>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gap: 1.5,
          gridTemplateColumns: {
            sm: `repeat(${metricColumnCount}, minmax(0, 1fr))`,
            xs: "minmax(0, 1fr)",
          },
          mt: label || action ? 1 : 0,
        }}
      >
        {metrics.map((metric, index) => (
          <Box key={index}>
            <Typography color="text.secondary" variant="body2">
              {metric.label}
            </Typography>
            <Typography
              sx={{
                color:
                  metric.valueTone === "positive"
                    ? "success.main"
                    : metric.valueTone === "negative"
                      ? "primary.main"
                      : "text.primary",
                fontSize: { md: "1.5rem", xs: "1.25rem" },
                fontWeight: 600,
                lineHeight: { md: 32 / 24, xs: 28 / 20 },
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
