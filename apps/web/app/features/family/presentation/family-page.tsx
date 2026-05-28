import {
  useAddFamilyCategory,
  useAddFamilyMember,
  useCreateFamilyRecurringLine,
  useDeleteFamilyRecurringLine,
  useFamily,
  useUpdateFamilyRecurringLine,
} from "../application/family-queries";
import type { FamilyRepository } from "../domain/family-repository";
import { FamilyDashboard } from "./family-dashboard";
import { FamilyErrorState } from "./family-error-state";
import { FamilyLoadingState } from "./family-loading-state";

interface FamilyPageProps {
  repository: FamilyRepository;
}

export function FamilyPage({ repository }: FamilyPageProps) {
  const familyQuery = useFamily(repository);
  const addMemberMutation = useAddFamilyMember(repository);
  const addCategoryMutation = useAddFamilyCategory(repository);
  const createLineMutation = useCreateFamilyRecurringLine(repository);
  const deleteLineMutation = useDeleteFamilyRecurringLine(repository);
  const updateLineMutation = useUpdateFamilyRecurringLine(repository);
  const isSaving =
    addMemberMutation.isPending ||
    addCategoryMutation.isPending ||
    createLineMutation.isPending ||
    deleteLineMutation.isPending ||
    updateLineMutation.isPending;
  const mutationError =
    getErrorMessage(addMemberMutation.error) ??
    getErrorMessage(addCategoryMutation.error) ??
    getErrorMessage(createLineMutation.error) ??
    getErrorMessage(deleteLineMutation.error) ??
    getErrorMessage(updateLineMutation.error);

  if (familyQuery.isPending) {
    return <FamilyLoadingState />;
  }

  if (familyQuery.isError) {
    return (
      <FamilyErrorState
        message={
          getErrorMessage(familyQuery.error) ?? "Le foyer est indisponible."
        }
        onRetry={() => void familyQuery.refetch()}
      />
    );
  }

  return (
    <FamilyDashboard
      family={familyQuery.data}
      isSaving={isSaving}
      mutationError={mutationError}
      onAddCategory={async (input) => {
        await addCategoryMutation.mutateAsync(input);
      }}
      onAddMember={async (input) => {
        await addMemberMutation.mutateAsync(input);
      }}
      onCreateRecurringLine={async (input) => {
        await createLineMutation.mutateAsync(input);
      }}
      onDeleteRecurringLine={async (lineId) => {
        await deleteLineMutation.mutateAsync(lineId);
      }}
      onUpdateRecurringLine={async (lineId, input) => {
        await updateLineMutation.mutateAsync({ input, lineId });
      }}
    />
  );
}

function getErrorMessage(error: Error | null): string | undefined {
  return error?.message;
}
