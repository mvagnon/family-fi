import {
  useAddFamilyCategory,
  useAddFamilyMember,
  useCreateFamilyRecurringLine,
  useFamily,
  useUpdateFamilyRecurringLine,
} from "../application/family-queries";
import { FamilyDashboard } from "./family-dashboard";
import { FamilyErrorState } from "./family-error-state";
import { FamilyLoadingState } from "./family-loading-state";

export function FamilyPage() {
  const familyQuery = useFamily();
  const addMemberMutation = useAddFamilyMember();
  const addCategoryMutation = useAddFamilyCategory();
  const createLineMutation = useCreateFamilyRecurringLine();
  const updateLineMutation = useUpdateFamilyRecurringLine();
  const isSaving =
    addMemberMutation.isPending ||
    addCategoryMutation.isPending ||
    createLineMutation.isPending ||
    updateLineMutation.isPending;
  const mutationError =
    getErrorMessage(addMemberMutation.error) ??
    getErrorMessage(addCategoryMutation.error) ??
    getErrorMessage(createLineMutation.error) ??
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
      onUpdateRecurringLine={async (lineId, input) => {
        await updateLineMutation.mutateAsync({ input, lineId });
      }}
    />
  );
}

function getErrorMessage(error: Error | null): string | undefined {
  return error?.message;
}
