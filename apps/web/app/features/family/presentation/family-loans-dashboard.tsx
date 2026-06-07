import { useState } from "react";
import { ConfirmationDialog } from "@repo/ui/confirmation-dialog";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import { useTranslation } from "react-i18next";

import {
  AppShellContent,
  AppShellTop,
  AppShellWidgets,
} from "../../app-shell/presentation/app-shell-layout";
import type {
  CreateLoanInput,
  CreateLoanRepaymentLineInput,
  Family,
  Loan,
  LoanRepaymentLine,
  UpdateLoanInput,
  UpdateLoanRepaymentLineInput,
  UpdateLoanVisibilityInput,
} from "../domain/family";
import {
  type FamilyLoanBalance,
  type FamilyLoanRepaymentLine,
  getFamilyLoanProjection,
} from "../domain/family-loans";
import { FamilyLoanModal } from "./family-loan-modal";
import { FamilyLoanRepaymentLineModal } from "./family-loan-repayment-line-modal";
import { FamilyLoansSidebar } from "./family-loans-sidebar";
import { FamilyLoansTable } from "./family-loans-table";
import { FamilyLoansTop } from "./family-loans-top";
import { FamilyPastLoansDialog } from "./family-past-loans-dialog";

interface FamilyLoansDashboardProps {
  family: Family;
  isSaving?: boolean;
  mutationError?: string;
  mutationErrorKey?: string;
  onCreateLoan: (input: CreateLoanInput) => Promise<void> | void;
  onCreateRepaymentLine: (
    input: CreateLoanRepaymentLineInput,
  ) => Promise<void> | void;
  onDeleteLoan: (loanId: string) => Promise<void> | void;
  onDeleteRepaymentLine: (lineId: string) => Promise<void> | void;
  onUpdateLoan: (
    loanId: string,
    input: UpdateLoanInput,
  ) => Promise<void> | void;
  onUpdateLoanVisibility: (
    loanId: string,
    input: UpdateLoanVisibilityInput,
  ) => Promise<void> | void;
  onUpdateRepaymentLine: (
    lineId: string,
    input: UpdateLoanRepaymentLineInput,
  ) => Promise<void> | void;
}

export function FamilyLoansDashboard({
  family,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onCreateLoan,
  onCreateRepaymentLine,
  onDeleteLoan,
  onDeleteRepaymentLine,
  onUpdateLoan,
  onUpdateLoanVisibility,
  onUpdateRepaymentLine,
}: FamilyLoansDashboardProps) {
  const { t } = useTranslation();
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isPastLoansDialogOpen, setIsPastLoansDialogOpen] = useState(false);
  const [loanDialogMode, setLoanDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [lineDialogMode, setLineDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [selectedLine, setSelectedLine] = useState<LoanRepaymentLine | null>(
    null,
  );
  const [loanPendingDeletion, setLoanPendingDeletion] =
    useState<FamilyLoanBalance | null>(null);
  const [linePendingDeletion, setLinePendingDeletion] =
    useState<FamilyLoanRepaymentLine | null>(null);
  const [localError, setLocalError] = useState<{
    message: string;
    revision: number;
  } | null>(null);
  const projection = getFamilyLoanProjection(family, {
    currentMonthIndex,
    currentYear,
    year,
  });
  const repaymentLoans = projection.activeLoans
    .filter((loan) => !loan.loan.isHidden)
    .map((loan) => loan.loan);
  const lineModalDefaultLoanId =
    selectedLine?.loanId ?? repaymentLoans[0]?.id ?? "";
  const lineModalLoans = getLoanRepaymentModalLoans(
    repaymentLoans,
    family.loans,
    selectedLine?.loanId,
  );

  function handleYearChange(nextYear: number) {
    setYear(Math.min(nextYear, currentYear));
  }

  function handleAddLoan() {
    setLoanDialogMode("create");
    setSelectedLoan(null);
    setIsLoanModalOpen(true);
  }

  function handleEditLoan(loan: FamilyLoanBalance) {
    setLoanDialogMode("edit");
    setSelectedLoan(loan.loan);
    setIsLoanModalOpen(true);
  }

  function handleAddLine() {
    if (!repaymentLoans.length || !lineModalDefaultLoanId) {
      showLocalError(t("loans.repaymentModal.errors.noActiveLoan"));
      return;
    }

    setLineDialogMode("create");
    setSelectedLine(null);
    setIsLineModalOpen(true);
  }

  function handleEditLine(line: FamilyLoanRepaymentLine) {
    setLineDialogMode("edit");
    setSelectedLine(line.line);
    setIsLineModalOpen(true);
  }

  async function handleSaveLoan(input: UpdateLoanInput) {
    try {
      if (loanDialogMode === "create") {
        await onCreateLoan(input);
      } else if (selectedLoan) {
        await onUpdateLoan(selectedLoan.id, input);
      }

      setLocalError(null);
      setIsLoanModalOpen(false);
      setSelectedLoan(null);
    } catch {
      return;
    }
  }

  async function handleSaveLine(input: CreateLoanRepaymentLineInput) {
    if (lineDialogMode === "edit" && !selectedLine) {
      return;
    }

    try {
      if (lineDialogMode === "create") {
        await onCreateRepaymentLine(input);
      } else if (selectedLine) {
        await onUpdateRepaymentLine(selectedLine.id, input);
      }

      setLocalError(null);
      setIsLineModalOpen(false);
      setSelectedLine(null);
      setYear(input.year);
    } catch {
      return;
    }
  }

  async function handleToggleLoanVisibility(loan: FamilyLoanBalance) {
    try {
      await onUpdateLoanVisibility(loan.loan.id, {
        isHidden: !loan.loan.isHidden,
      });
      setLocalError(null);
    } catch {
      return;
    }
  }

  async function handleConfirmDeleteLoan() {
    if (!loanPendingDeletion) {
      return;
    }

    try {
      await onDeleteLoan(loanPendingDeletion.loan.id);
      setLoanPendingDeletion(null);
    } catch {
      return;
    }
  }

  async function handleConfirmDeleteLine() {
    if (!linePendingDeletion) {
      return;
    }

    try {
      await onDeleteRepaymentLine(linePendingDeletion.line.id);
      setLinePendingDeletion(null);
    } catch {
      return;
    }
  }

  function showLocalError(message: string) {
    setLocalError((currentError) => ({
      message,
      revision: (currentError?.revision ?? 0) + 1,
    }));
  }

  return (
    <>
      <AppShellTop>
        <FamilyLoansTop
          currentYear={currentYear}
          onYearChange={handleYearChange}
          summary={projection.summary}
          year={year}
        />
      </AppShellTop>
      <AppShellContent>
        <FamilyLoansTable
          disabled={isSaving}
          hasLoans={repaymentLoans.length > 0}
          key={year}
          monthGroups={projection.monthGroups}
          onAddLine={handleAddLine}
          onDeleteLine={setLinePendingDeletion}
          onEditLine={handleEditLine}
        />
        <FeedbackSnackbar
          key={localError ? `local-${localError.revision}` : mutationErrorKey}
          message={localError?.message ?? mutationError}
        />
        <FamilyLoanModal
          initialLoan={selectedLoan ?? undefined}
          isSaving={isSaving}
          key={selectedLoan ? `edit-${selectedLoan.id}` : "create-loan"}
          mode={loanDialogMode}
          onClose={() => setIsLoanModalOpen(false)}
          onSave={handleSaveLoan}
          open={isLoanModalOpen}
        />
        {lineModalDefaultLoanId ? (
          <FamilyLoanRepaymentLineModal
            currentMonthIndex={currentMonthIndex}
            currentYear={currentYear}
            defaultLoanId={lineModalDefaultLoanId}
            defaultYear={year}
            family={family}
            initialLine={selectedLine ?? undefined}
            isSaving={isSaving}
            key={
              selectedLine
                ? `${lineDialogMode}-${selectedLine.id}`
                : `${lineDialogMode}-${lineModalDefaultLoanId}-${year}`
            }
            loans={lineModalLoans}
            mode={lineDialogMode}
            onClose={() => setIsLineModalOpen(false)}
            onSave={handleSaveLine}
            open={isLineModalOpen}
          />
        ) : null}
        <FamilyPastLoansDialog
          disabled={isSaving}
          loans={projection.pastLoans}
          onClose={() => setIsPastLoansDialogOpen(false)}
          onDeleteLoan={setLoanPendingDeletion}
          onEditLoan={handleEditLoan}
          onToggleLoanVisibility={handleToggleLoanVisibility}
          open={isPastLoansDialogOpen}
        />
        <ConfirmationDialog
          confirmColor="error"
          confirmFirst
          cancelLabel={t("common.cancel")}
          confirmLabel={t("family.deletion.confirm")}
          description={t("loans.deletion.loanDescription")}
          isPending={isSaving}
          onCancel={() => setLoanPendingDeletion(null)}
          onConfirm={handleConfirmDeleteLoan}
          open={loanPendingDeletion !== null}
          title={t("loans.deletion.loanTitle")}
        />
        <ConfirmationDialog
          confirmColor="error"
          confirmFirst
          cancelLabel={t("common.cancel")}
          confirmLabel={t("family.deletion.confirm")}
          description={t("loans.deletion.lineDescription")}
          isPending={isSaving}
          onCancel={() => setLinePendingDeletion(null)}
          onConfirm={handleConfirmDeleteLine}
          open={linePendingDeletion !== null}
          title={t("loans.deletion.lineTitle")}
        />
      </AppShellContent>
      <AppShellWidgets>
        <FamilyLoansSidebar
          disabled={isSaving}
          loans={projection.activeLoans}
          onAddLoan={handleAddLoan}
          onDeleteLoan={setLoanPendingDeletion}
          onEditLoan={handleEditLoan}
          onToggleLoanVisibility={handleToggleLoanVisibility}
          onViewPastLoans={() => setIsPastLoansDialogOpen(true)}
          pastLoanCount={projection.pastLoans.length}
        />
      </AppShellWidgets>
    </>
  );
}

function getLoanRepaymentModalLoans(
  activeLoans: Loan[],
  allLoans: Loan[],
  selectedLoanId: string | undefined,
): Loan[] {
  if (!selectedLoanId) {
    return activeLoans;
  }

  const selectedLoan = allLoans.find((loan) => loan.id === selectedLoanId);

  if (
    !selectedLoan ||
    activeLoans.some((loan) => loan.id === selectedLoan.id)
  ) {
    return activeLoans;
  }

  return [...activeLoans, selectedLoan];
}
