import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import type { FamilyLoanBalance } from "../domain/family-loans";
import { FamilyLoanListRow } from "./family-loan-list-row";

interface FamilyLoansSidebarProps {
  disabled: boolean;
  loans: FamilyLoanBalance[];
  onAddLoan: () => void;
  onDeleteLoan: (loan: FamilyLoanBalance) => void;
  onEditLoan: (loan: FamilyLoanBalance) => void;
  onToggleLoanVisibility: (loan: FamilyLoanBalance) => void;
  onViewPastLoans: () => void;
  pastLoanCount: number;
}

export function FamilyLoansSidebar({
  disabled,
  loans,
  onAddLoan,
  onDeleteLoan,
  onEditLoan,
  onToggleLoanVisibility,
  onViewPastLoans,
  pastLoanCount,
}: FamilyLoansSidebarProps) {
  const { t } = useTranslation();

  return (
    <SectionPanel
      action={
        <ActionIconButton
          disabled={disabled}
          icon={<AddIcon />}
          label={t("loans.sidebar.addLabel")}
          onClick={onAddLoan}
        />
      }
      contentSx={{ pb: { md: 2, xs: 1.5 }, px: { md: 2, xs: 1.5 } }}
      headerSx={{ p: { md: 2, xs: 1.5 } }}
      subtitle={t("loans.sidebar.subtitle", {
        count: loans.length,
      })}
      title={t("loans.sidebar.title")}
      titleId="family-loans-sidebar-title"
      titleVariant="h3"
    >
      <Stack spacing={2}>
        {loans.length > 0 ? (
          loans.map((loan) => (
            <FamilyLoanListRow
              disabled={disabled}
              key={loan.loan.id}
              loan={loan}
              onDeleteLoan={onDeleteLoan}
              onEditLoan={onEditLoan}
              onToggleLoanVisibility={onToggleLoanVisibility}
            />
          ))
        ) : (
          <Typography color="text.secondary" variant="body2">
            {t("loans.sidebar.empty")}
          </Typography>
        )}
        {pastLoanCount > 0 && (
          <Button
            disabled={disabled}
            onClick={onViewPastLoans}
            startIcon={<HistoryIcon />}
            sx={{ justifyContent: "flex-start", mt: 1 }}
            variant="text"
          >
            {t("loans.sidebar.pastLoans", { count: pastLoanCount })}
          </Button>
        )}
      </Stack>
    </SectionPanel>
  );
}
