import { FamilyPage } from "~/features/family/presentation/family-page";
import { familyHttpRepository } from "~/features/family/infrastructure/family-http-repository";
import { FamilyErrorState } from "~/features/family/presentation/family-error-state";
import { FamilyLoadingState } from "~/features/family/presentation/family-loading-state";
import { useActiveSpace } from "~/features/spaces/presentation/active-space-provider";
import i18n from "~/i18n";

import type { Route } from "./+types/family";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("family.meta.title") },
    {
      name: "description",
      content: i18n.t("family.meta.description"),
    },
  ];
}

export default function FamilyRoute() {
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
    <FamilyPage
      canWrite={activeSpace.permissions.canWrite}
      repository={familyHttpRepository}
      spaceId={activeSpace.activeSpaceId}
    />
  );
}
