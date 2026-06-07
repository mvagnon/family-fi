import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { useTranslation } from "react-i18next";

import type { FamilyLoanBalance } from "../domain/family-loans";
import { useFamilyFormat } from "./use-family-format";

interface FamilyLoanListRowProps {
  disabled: boolean;
  isVisible: boolean;
  loan: FamilyLoanBalance;
  onDeleteLoan: (loan: FamilyLoanBalance) => void;
  onEditLoan: (loan: FamilyLoanBalance) => void;
  onToggleLoanVisibility: (loan: FamilyLoanBalance) => void;
}

export function FamilyLoanListRow({
  disabled,
  isVisible,
  loan,
  onDeleteLoan,
  onEditLoan,
  onToggleLoanVisibility,
}: FamilyLoanListRowProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();

  return (
    <Box
      sx={{
        display: "grid",
        gap: 0.75,
        opacity: isVisible ? 1 : 0.58,
        py: 1.25,
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "grid",
          gap: 1,
          gridTemplateColumns: "minmax(0, 1fr) auto",
          minWidth: 0,
        }}
      >
        <Typography noWrap sx={{ fontWeight: 700 }}>
          {loan.loan.title}
        </Typography>
        <Stack
          direction="row"
          spacing={0.25}
          sx={{ flexShrink: 0, justifyContent: "flex-end" }}
        >
          <ActionIconButton
            disabled={disabled}
            icon={<EditIcon fontSize="small" />}
            label={t("loans.sidebar.editLabel", { title: loan.loan.title })}
            onClick={() => onEditLoan(loan)}
            size="small"
            tooltip={t("loans.sidebar.editTooltip")}
          />
          <ActionIconButton
            disabled={disabled}
            icon={
              isVisible ? (
                <VisibilityIcon fontSize="small" />
              ) : (
                <VisibilityOffIcon fontSize="small" />
              )
            }
            label={t(
              isVisible ? "loans.sidebar.hideLabel" : "loans.sidebar.showLabel",
              { title: loan.loan.title },
            )}
            onClick={() => onToggleLoanVisibility(loan)}
            size="small"
            tooltip={t(
              isVisible
                ? "loans.sidebar.hideTooltip"
                : "loans.sidebar.showTooltip",
            )}
          />
          <ActionIconButton
            disabled={disabled}
            icon={<DeleteIcon fontSize="small" />}
            label={t("loans.sidebar.deleteLabel", { title: loan.loan.title })}
            onClick={() => onDeleteLoan(loan)}
            size="small"
            tooltip={t("loans.sidebar.deleteTooltip")}
          />
        </Stack>
      </Box>
      <Box sx={{ display: "grid", gap: 0.5, minWidth: 0 }}>
        <Typography color="text.secondary" variant="body2">
          {t("loans.sidebar.initialAmount", {
            value: familyFormat.formatCurrency(loan.loan.initialAmount),
          })}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {t("loans.sidebar.interestRate", {
            value: formatInterestRate(loan.loan.annualInterestRate),
          })}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {t("loans.sidebar.remainingAmount", {
            value: familyFormat.formatCurrency(loan.remainingAmount),
          })}
        </Typography>
      </Box>
    </Box>
  );
}

function formatInterestRate(value: number): string {
  return `${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value)}%`;
}
