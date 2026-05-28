import { FamilyPage } from "~/features/family/presentation/family-page";

import type { Route } from "./+types/family";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Family-Fi | Foyer" },
    {
      name: "description",
      content: "Household recurring finances setup.",
    },
  ];
}

export default function FamilyRoute() {
  return <FamilyPage />;
}
