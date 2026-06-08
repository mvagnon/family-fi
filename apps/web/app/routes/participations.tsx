import { familyHttpRepository } from "~/features/family/infrastructure/family-http-repository";
import { FamilyErrorState } from "~/features/family/presentation/family-error-state";
import { FamilyLoadingState } from "~/features/family/presentation/family-loading-state";
import { FamilyParticipationsPage } from "~/features/family/presentation/family-participations-page";
import { useActiveSpace } from "~/features/spaces/presentation/active-space-provider";
import i18n from "~/i18n";

import type { Route } from "./+types/participations";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("participations.meta.title") },
    {
      name: "description",
      content: i18n.t("participations.meta.description"),
    },
  ];
}

export default function ParticipationsRoute() {
  const activeSpace = useActiveSpace();

  if (activeSpace.isPending) {
    return <FamilyLoadingState />;
  }

  if (activeSpace.error || !activeSpace.activeSpaceId) {
    return (
      <FamilyErrorState
        isRetrying={activeSpace.isFetching}
        message={i18n.t("family.error.unavailableMessage")}
        onRetry={activeSpace.refetch}
      />
    );
  }

  return (
    <FamilyParticipationsPage
      canWrite={activeSpace.permissions.canWrite}
      repository={familyHttpRepository}
      spaceId={activeSpace.activeSpaceId}
    />
  );
}
