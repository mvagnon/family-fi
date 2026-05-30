import { FamilyPage } from "~/features/family/presentation/family-page";
import { familyHttpRepository } from "~/features/family/infrastructure/family-http-repository";
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
  return <FamilyPage repository={familyHttpRepository} />;
}
