import {
  useCreateFamilyLoan,
  useCreateFamilyLoanRepaymentLine,
  useDeleteFamilyLoan,
  useDeleteFamilyLoanRepaymentLine,
  useFamily,
  useUpdateFamilyLoan,
  useUpdateFamilyLoanRepaymentLine,
} from "../application/family-queries";
import type { FamilyRepository } from "../domain/family-repository";
import { FamilyErrorState } from "./family-error-state";
import { FamilyLoadingState } from "./family-loading-state";
import { getFamilyMutationError } from "./family-mutation-error";
import { FamilyLoansDashboard } from "./family-loans-dashboard";
import { useTranslation } from "react-i18next";

interface FamilyLoansPageProps {
  canWrite: boolean;
  repository: FamilyRepository;
  spaceId: string;
}

export function FamilyLoansPage({
  canWrite,
  repository,
  spaceId,
}: FamilyLoansPageProps) {
  const { t } = useTranslation();
  const familyQuery = useFamily(repository, spaceId);
  const createLoanMutation = useCreateFamilyLoan(repository, spaceId);
  const updateLoanMutation = useUpdateFamilyLoan(repository, spaceId);
  const deleteLoanMutation = useDeleteFamilyLoan(repository, spaceId);
  const createLineMutation = useCreateFamilyLoanRepaymentLine(
    repository,
    spaceId,
  );
  const updateLineMutation = useUpdateFamilyLoanRepaymentLine(
    repository,
    spaceId,
  );
  const deleteLineMutation = useDeleteFamilyLoanRepaymentLine(
    repository,
    spaceId,
  );
  const isSaving =
    createLoanMutation.isPending ||
    updateLoanMutation.isPending ||
    deleteLoanMutation.isPending ||
    createLineMutation.isPending ||
    updateLineMutation.isPending ||
    deleteLineMutation.isPending;
  const mutationError = getFamilyMutationError([
    createLoanMutation,
    updateLoanMutation,
    deleteLoanMutation,
    createLineMutation,
    updateLineMutation,
    deleteLineMutation,
  ]);

  if (familyQuery.isPending) {
    return <FamilyLoadingState />;
  }

  if (familyQuery.error) {
    return (
      <FamilyErrorState
        isRetrying={familyQuery.isFetching}
        message={
          familyQuery.error.message ?? t("family.error.unavailableMessage")
        }
        onRetry={() => void familyQuery.refetch()}
      />
    );
  }

  return (
    <FamilyLoansDashboard
      canWrite={canWrite}
      family={familyQuery.data}
      isSaving={isSaving}
      mutationError={mutationError?.message}
      mutationErrorKey={mutationError?.key}
      onCreateLoan={async (input) => {
        await createLoanMutation.mutateAsync(input);
      }}
      onCreateRepaymentLine={async (input) => {
        await createLineMutation.mutateAsync(input);
      }}
      onDeleteLoan={async (loanId) => {
        await deleteLoanMutation.mutateAsync(loanId);
      }}
      onDeleteRepaymentLine={async (lineId) => {
        await deleteLineMutation.mutateAsync(lineId);
      }}
      onUpdateLoan={async (loanId, input) => {
        await updateLoanMutation.mutateAsync({ input, loanId });
      }}
      onUpdateRepaymentLine={async (lineId, input) => {
        await updateLineMutation.mutateAsync({ input, lineId });
      }}
    />
  );
}
