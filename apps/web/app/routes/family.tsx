import { FamilyPage } from "~/features/family/presentation/family-page";
import { familyHttpRepository } from "~/features/family/infrastructure/family-http-repository";
import { FamilyErrorState } from "~/features/family/presentation/family-error-state";
import { FamilyLoadingState } from "~/features/family/presentation/family-loading-state";
import { useUserSettings } from "~/features/spaces/application/space-queries";
import { spacesHttpRepository } from "~/features/spaces/infrastructure/spaces-http-repository";
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
  const settingsQuery = useUserSettings(spacesHttpRepository);

  if (settingsQuery.isPending) {
    return <FamilyLoadingState />;
  }

  if (settingsQuery.error || !settingsQuery.data.defaultSpaceId) {
    return (
      <FamilyErrorState
        isRetrying={settingsQuery.isFetching}
        message={i18n.t("family.error.unavailableMessage")}
        onRetry={() => void settingsQuery.refetch()}
      />
    );
  }

  return (
    <FamilyPage
      repository={familyHttpRepository}
      spaceId={settingsQuery.data.defaultSpaceId}
    />
  );
}
