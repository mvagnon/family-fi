import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import type { RecurringLine } from "../domain/family";
import { LineSummaryContent } from "./line-summary-content";

export { LineSummaryContent } from "./line-summary-content";

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
