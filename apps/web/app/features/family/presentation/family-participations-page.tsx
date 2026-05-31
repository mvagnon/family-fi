import {
  useCreateFamilyParticipationLine,
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
  const mutationError = getFamilyMutationError([createLineMutation]);

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
      isSaving={createLineMutation.isPending}
      mutationError={mutationError?.message}
      mutationErrorKey={mutationError?.key}
      onCreateParticipationLine={async (input) => {
        await createLineMutation.mutateAsync(input);
      }}
    />
  );
}
