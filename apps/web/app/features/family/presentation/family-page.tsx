import Button from "@mui/material/Button";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import { PageShell } from "@repo/ui/page-shell";

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
      <PageShell
        subtitle="Dépenses, revenus et récurrences du foyer"
        title="Foyer"
      >
        <FeedbackSnackbar
          action={
            <Button
              color="inherit"
              onClick={() => void familyQuery.refetch()}
              size="small"
            >
              Réessayer
            </Button>
          }
          autoHideDuration={null}
          message={
            getErrorMessage(familyQuery.error) ?? "Le foyer est indisponible."
          }
        />
      </PageShell>
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
