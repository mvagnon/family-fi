import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { FamilyBudgetLine } from "../domain/family-budget";
import { LineSummaryContent } from "./line-summary-content";

export { LineSummaryContent } from "./line-summary-content";

interface LineSummaryDialogProps {
  categoryLabel: string;
  line: FamilyBudgetLine | null;
  onClose: () => void;
  open: boolean;
}

interface VisibleLineSummaryDialog {
  categoryLabel: string;
  line: FamilyBudgetLine;
}

export function LineSummaryDialog({
  categoryLabel,
  line,
  onClose,
  open,
}: LineSummaryDialogProps) {
  const { t } = useTranslation();
  const [lastDialog, setLastDialog] = useState<VisibleLineSummaryDialog | null>(
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
      <DialogTitle>{t("family.line.summaryTitle")}</DialogTitle>
      <DialogContent>
        <LineSummaryContent
          categoryLabel={dialog.categoryLabel}
          line={dialog.line}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
