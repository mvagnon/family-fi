import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect, useState } from "react";

import type { RecurringLine } from "../domain/family";
import { LineSummaryContent } from "./line-summary-content";

export { LineSummaryContent } from "./line-summary-content";

interface LineSummaryDialogProps {
  categoryLabel: string;
  line: RecurringLine | null;
  onClose: () => void;
  open: boolean;
}

interface VisibleLineSummaryDialog {
  categoryLabel: string;
  line: RecurringLine;
}

export function LineSummaryDialog({
  categoryLabel,
  line,
  onClose,
  open,
}: LineSummaryDialogProps) {
  const [lastDialog, setLastDialog] =
    useState<VisibleLineSummaryDialog | null>(
      line ? { categoryLabel, line } : null,
    );
  const dialog = line ? { categoryLabel, line } : lastDialog;

  useEffect(() => {
    if (line) {
      setLastDialog({ categoryLabel, line });
    }
  }, [categoryLabel, line]);

  function handleExited() {
    if (!line) {
      setLastDialog(null);
    }
  }

  if (!dialog) {
    return null;
  }

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      onClose={onClose}
      open={open}
      slotProps={{ transition: { onExited: handleExited } }}
    >
      <DialogTitle>Résumé de ligne</DialogTitle>
      <DialogContent>
        <LineSummaryContent
          categoryLabel={dialog.categoryLabel}
          line={dialog.line}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
