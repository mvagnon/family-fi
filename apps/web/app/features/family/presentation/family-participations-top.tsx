import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MetricSummaryCard } from "@repo/ui/metric-summary-card";
import { useTranslation } from "react-i18next";

import type { FamilyParticipationSummary } from "../domain/family-participations";
import { useFamilyFormat } from "./use-family-format";

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
          md: "minmax(280px, 0.7fr) minmax(0, 1fr)",
          xs: "minmax(0, 1fr)",
        },
      }}
    >
      <Paper
        component="section"
        sx={{
          bgcolor: "background.paper",
          display: "grid",
          justifyItems: "center",
          p: { md: 2.5, xs: 2 },
          textAlign: "center",
        }}
      >
        <Typography
          color="text.secondary"
          sx={{ justifySelf: "start", textAlign: "left" }}
          variant="overline"
        >
          {t("participations.top.selection")}
        </Typography>
        <Stack
          spacing={1.5}
          sx={{
            alignItems: "center",
            mt: 1,
          }}
        >
          <Stack
            aria-label={t("participations.top.yearAriaLabel")}
            direction="row"
            spacing={0.5}
            sx={{ alignItems: "center", justifyContent: "center" }}
          >
            <IconButton
              aria-label={t("participations.top.previousYear")}
              onClick={() => onYearChange(year - 1)}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 700,
                minWidth: 72,
                textAlign: "center",
              }}
              variant="h2"
            >
              {year}
            </Typography>
            <IconButton
              aria-label={t("participations.top.nextYear")}
              disabled={year >= currentYear}
              onClick={() => onYearChange(year + 1)}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

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
