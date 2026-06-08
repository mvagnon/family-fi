import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import type { FamilyLoanBalance } from "../domain/family-loans";
import { FamilyLoanListRow } from "./family-loan-list-row";

interface FamilyPastLoansDialogProps {
  disabled: boolean;
  isLoanVisible: (loanId: string) => boolean;
  loans: FamilyLoanBalance[];
  onClose: () => void;
  onDeleteLoan?: (loan: FamilyLoanBalance) => void;
  onEditLoan?: (loan: FamilyLoanBalance) => void;
  onToggleLoanVisibility: (loan: FamilyLoanBalance) => void;
  open: boolean;
}

export function FamilyPastLoansDialog({
  disabled,
  isLoanVisible,
  loans,
  onClose,
  onDeleteLoan,
  onEditLoan,
  onToggleLoanVisibility,
  open,
}: FamilyPastLoansDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>{t("loans.pastDialog.title")}</DialogTitle>
      <DialogContent>
        {loans.length > 0 ? (
          <Stack divider={<Divider flexItem />} spacing={0} sx={{ pt: 1 }}>
            {loans.map((loan) => (
              <FamilyLoanListRow
                disabled={disabled}
                isVisible={isLoanVisible(loan.loan.id)}
                key={loan.loan.id}
                loan={loan}
                onDeleteLoan={onDeleteLoan}
                onEditLoan={onEditLoan}
                onToggleLoanVisibility={onToggleLoanVisibility}
              />
            ))}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ py: 2 }} variant="body2">
            {t("loans.pastDialog.empty")}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={disabled} onClick={onClose}>
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
