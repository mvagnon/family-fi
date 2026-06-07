import {
  useAddFamilyMember,
  useCreateFamilyDistributionLine,
  useDeleteFamilyDistributionLine,
  useDeleteFamilyMember,
  useFamily,
  useUpdateFamilyDistributionLine,
  useUpdateFamilyMember,
} from "../application/family-queries";
import type { FamilyRepository } from "../domain/family-repository";
import { FamilyErrorState } from "./family-error-state";
import { FamilyLoadingState } from "./family-loading-state";
import { FamilyDistributionsDashboard } from "./family-distributions-dashboard";
import { getFamilyMutationError } from "./family-mutation-error";
import { useTranslation } from "react-i18next";

interface FamilyDistributionsPageProps {
  repository: FamilyRepository;
  spaceId: string;
}

export function FamilyDistributionsPage({
  repository,
  spaceId,
}: FamilyDistributionsPageProps) {
  const { t } = useTranslation();
  const familyQuery = useFamily(repository, spaceId);
  const createLineMutation = useCreateFamilyDistributionLine(
    repository,
    spaceId,
  );
  const updateLineMutation = useUpdateFamilyDistributionLine(
    repository,
    spaceId,
  );
  const deleteLineMutation = useDeleteFamilyDistributionLine(
    repository,
    spaceId,
  );
  const addMemberMutation = useAddFamilyMember(repository, spaceId);
  const deleteMemberMutation = useDeleteFamilyMember(repository, spaceId);
  const updateMemberMutation = useUpdateFamilyMember(repository, spaceId);
  const isSaving =
    createLineMutation.isPending ||
    updateLineMutation.isPending ||
    deleteLineMutation.isPending ||
    addMemberMutation.isPending ||
    deleteMemberMutation.isPending ||
    updateMemberMutation.isPending;
  const mutationError = getFamilyMutationError([
    createLineMutation,
    updateLineMutation,
    deleteLineMutation,
    addMemberMutation,
    deleteMemberMutation,
    updateMemberMutation,
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
    <FamilyDistributionsDashboard
      family={familyQuery.data}
      isSaving={isSaving}
      mutationError={mutationError?.message}
      mutationErrorKey={mutationError?.key}
      onAddMember={async (input) => {
        await addMemberMutation.mutateAsync(input);
      }}
      onCreateDistributionLine={async (input) => {
        await createLineMutation.mutateAsync(input);
      }}
      onDeleteDistributionLine={async (lineId) => {
        await deleteLineMutation.mutateAsync(lineId);
      }}
      onDeleteMember={async (memberId) => {
        await deleteMemberMutation.mutateAsync(memberId);
      }}
      onUpdateDistributionLine={async (lineId, input) => {
        await updateLineMutation.mutateAsync({ input, lineId });
      }}
      onUpdateMember={async (memberId, input) => {
        await updateMemberMutation.mutateAsync({ input, memberId });
      }}
    />
  );
}
