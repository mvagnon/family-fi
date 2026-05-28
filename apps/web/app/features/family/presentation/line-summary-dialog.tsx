import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { RecurringLine } from "../domain/family";
import { formatLineAmount, formatRecurrence } from "./family-format";

interface LineSummaryDialogProps {
  categoryLabel: string;
  line: RecurringLine | null;
  onClose: () => void;
  open: boolean;
}

export function LineSummaryDialog({
  categoryLabel,
  line,
  onClose,
  open,
}: LineSummaryDialogProps) {
  if (!line) {
    return null;
  }

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Résumé de ligne</DialogTitle>
      <DialogContent>
        <LineSummaryContent categoryLabel={categoryLabel} line={line} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}

interface LineSummaryContentProps {
  categoryLabel: string;
  line: RecurringLine;
}

export function LineSummaryContent({
  categoryLabel,
  line,
}: LineSummaryContentProps) {
  return (
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Stack spacing={0.5}>
        <Typography variant="h3">{line.title}</Typography>
        <Typography color="text.secondary">{categoryLabel}</Typography>
      </Stack>

      <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
        <SummaryItem label="Montant" value={formatLineAmount(line)} />
        <SummaryItem
          label="Récurrence"
          value={formatRecurrence(line.recurrenceMonths)}
        />
      </Stack>

      <Stack spacing={0.75}>
        <Typography color="text.secondary" variant="body2">
          Description
        </Typography>
        <Typography>{line.description || "Aucune description."}</Typography>
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
      <Typography sx={{ fontWeight: 800 }}>{value}</Typography>
    </Stack>
  );
}
