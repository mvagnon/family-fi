import {
  useAddFamilyMember,
  useCreateFamilyParticipationLine,
  useDeleteFamilyMember,
  useFamily,
} from "../application/family-queries";
import type { FamilyRepository } from "../domain/family-repository";
import { FamilyErrorState } from "./family-error-state";
import { FamilyLoadingState } from "./family-loading-state";
import { getFamilyMutationError } from "./family-mutation-error";
import { FamilyParticipationsDashboard } from "./family-participations-dashboard";
import { useTranslation } from "react-i18next";

interface FamilyParticipationsPageProps {
  repository: FamilyRepository;
  spaceId: string;
}

export function FamilyParticipationsPage({
  repository,
  spaceId,
}: FamilyParticipationsPageProps) {
  const { t } = useTranslation();
  const familyQuery = useFamily(repository, spaceId);
  const createLineMutation = useCreateFamilyParticipationLine(
    repository,
    spaceId,
  );
  const addMemberMutation = useAddFamilyMember(repository, spaceId);
  const deleteMemberMutation = useDeleteFamilyMember(repository, spaceId);
  const isSaving =
    createLineMutation.isPending ||
    addMemberMutation.isPending ||
    deleteMemberMutation.isPending;
  const mutationError = getFamilyMutationError([
    createLineMutation,
    addMemberMutation,
    deleteMemberMutation,
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
    <FamilyParticipationsDashboard
      family={familyQuery.data}
      isSaving={isSaving}
      mutationError={mutationError?.message}
      mutationErrorKey={mutationError?.key}
      onAddMember={async (input) => {
        await addMemberMutation.mutateAsync(input);
      }}
      onCreateParticipationLine={async (input) => {
        await createLineMutation.mutateAsync(input);
      }}
      onDeleteMember={async (memberId) => {
        await deleteMemberMutation.mutateAsync(memberId);
      }}
    />
  );
}
