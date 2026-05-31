import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { MetricSummaryCard } from "@repo/ui/metric-summary-card";
import { useTranslation } from "react-i18next";

import type { FamilyMember } from "../domain/family";
import type { FamilyParticipationSummary } from "../domain/family-participations";
import { useFamilyFormat } from "./use-family-format";

interface FamilyParticipationsTopProps {
  members: FamilyMember[];
  onMemberChange: (memberId: string) => void;
  onYearChange: (year: number) => void;
  selectedMember: FamilyMember | null;
  summary: FamilyParticipationSummary;
  year: number;
}

export function FamilyParticipationsTop({
  members,
  onMemberChange,
  onYearChange,
  selectedMember,
  summary,
  year,
}: FamilyParticipationsTopProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ md: "row", xs: "column" }}
        spacing={1.5}
        sx={{
          alignItems: { md: "center", xs: "stretch" },
          justifyContent: "space-between",
        }}
      >
        <Stack
          aria-label={t("participations.top.yearAriaLabel")}
          direction="row"
          spacing={0.5}
          sx={{ alignItems: "center" }}
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
            onClick={() => onYearChange(year + 1)}
          >
            <KeyboardArrowRightIcon />
          </IconButton>
        </Stack>

        <TextField
          disabled={members.length === 0}
          fullWidth
          helperText={
            selectedMember && !selectedMember.isActive
              ? t("participations.top.inactiveSelected")
              : undefined
          }
          label={t("participations.top.memberLabel")}
          onChange={(event) => onMemberChange(event.target.value)}
          select
          sx={{ maxWidth: { md: 320, xs: "none" } }}
          value={selectedMember?.id ?? ""}
        >
          {members.map((member) => (
            <MenuItem key={member.id} value={member.id}>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  gap: 1,
                  minWidth: 0,
                }}
              >
                <Typography noWrap>{member.name}</Typography>
                {!member.isActive ? (
                  <Chip
                    label={t("participations.top.inactive")}
                    size="small"
                    variant="outlined"
                  />
                ) : null}
              </Box>
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <MetricSummaryCard
        label={t("participations.top.averageMetrics")}
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
    </Stack>
  );
}
