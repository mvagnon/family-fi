import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import type { RecurringLine } from "../domain/family";
import { useFamilyFormat } from "./use-family-format";

interface LineSummaryContentProps {
  categoryLabel: string;
  line: RecurringLine;
}

export function LineSummaryContent({
  categoryLabel,
  line,
}: LineSummaryContentProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();

  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Stack spacing={0.5}>
        <Typography variant="h3">{line.title}</Typography>
        <Typography color="text.secondary">{categoryLabel}</Typography>
      </Stack>

      <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
        <SummaryItem
          label={t("family.line.fields.amount")}
          value={familyFormat.formatLineAmount(line)}
        />
        <SummaryItem
          label={t("family.line.fields.recurrence")}
          value={familyFormat.formatRecurrence(line.recurrenceMonths)}
        />
      </Stack>

      <Stack spacing={0.75}>
        <Typography color="text.secondary" variant="body2">
          {t("family.line.fields.description")}
        </Typography>
        <Typography>
          {line.description || t("family.line.noDescription")}
        </Typography>
      </Stack>
    </Stack>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Stack>
  );
}
