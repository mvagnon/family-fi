import {
  useAddFamilyCategory,
  useAddFamilyMember,
  useCreateFamilyRecurringLine,
  useDeleteFamilyCategory,
  useDeleteFamilyMember,
  useDeleteFamilyRecurringLine,
  useFamily,
  useUpdateFamilyMember,
  useUpdateFamilyRecurringLine,
} from "../application/family-queries";
import type { FamilyRepository } from "../domain/family-repository";
import { FamilyDashboard } from "./family-dashboard";
import { FamilyErrorState } from "./family-error-state";
import { FamilyLoadingState } from "./family-loading-state";
import { getFamilyMutationError } from "./family-mutation-error";
import { useTranslation } from "react-i18next";

interface FamilyPageProps {
  repository: FamilyRepository;
  spaceId: string;
}

export function FamilyPage({ repository, spaceId }: FamilyPageProps) {
  const { t } = useTranslation();
  const familyQuery = useFamily(repository, spaceId);
  const addMemberMutation = useAddFamilyMember(repository, spaceId);
  const addCategoryMutation = useAddFamilyCategory(repository, spaceId);
  const createLineMutation = useCreateFamilyRecurringLine(repository, spaceId);
  const deleteCategoryMutation = useDeleteFamilyCategory(repository, spaceId);
  const deleteLineMutation = useDeleteFamilyRecurringLine(repository, spaceId);
  const deleteMemberMutation = useDeleteFamilyMember(repository, spaceId);
  const updateMemberMutation = useUpdateFamilyMember(repository, spaceId);
  const updateLineMutation = useUpdateFamilyRecurringLine(repository, spaceId);
  const isSaving =
    addMemberMutation.isPending ||
    addCategoryMutation.isPending ||
    createLineMutation.isPending ||
    deleteCategoryMutation.isPending ||
    deleteLineMutation.isPending ||
    deleteMemberMutation.isPending ||
    updateMemberMutation.isPending ||
    updateLineMutation.isPending;
  const mutationError = getFamilyMutationError([
    addMemberMutation,
    addCategoryMutation,
    createLineMutation,
    deleteCategoryMutation,
    deleteLineMutation,
    deleteMemberMutation,
    updateMemberMutation,
    updateLineMutation,
  ]);

  if (familyQuery.isPending) {
    return <FamilyLoadingState />;
  }

  if (familyQuery.error) {
    return (
      <FamilyErrorState
        isRetrying={familyQuery.isFetching}
        message={
          getErrorMessage(familyQuery.error) ??
          t("family.error.unavailableMessage")
        }
        onRetry={() => void familyQuery.refetch()}
      />
    );
  }

  return (
    <FamilyDashboard
      family={familyQuery.data}
      isSaving={isSaving}
      mutationError={mutationError?.message}
      mutationErrorKey={mutationError?.key}
      onAddCategory={async (input) => {
        await addCategoryMutation.mutateAsync(input);
      }}
      onAddMember={async (input) => {
        await addMemberMutation.mutateAsync(input);
      }}
      onCreateRecurringLine={async (input) => {
        await createLineMutation.mutateAsync(input);
      }}
      onDeleteCategory={async (categoryId) => {
        await deleteCategoryMutation.mutateAsync(categoryId);
      }}
      onDeleteMember={async (memberId) => {
        await deleteMemberMutation.mutateAsync(memberId);
      }}
      onDeleteRecurringLine={async (lineId) => {
        await deleteLineMutation.mutateAsync(lineId);
      }}
      onUpdateMember={async (memberId, input) => {
        await updateMemberMutation.mutateAsync({ input, memberId });
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
