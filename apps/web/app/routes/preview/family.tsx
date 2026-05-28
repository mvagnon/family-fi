import { FamilyPreviewPage } from "~/features/family/presentation/family-preview-page";

export function meta() {
  return [
    { title: "Family-Fi | Foyer preview" },
    {
      name: "description",
      content: "Preview page for household recurring finances setup.",
    },
  ];
}

export default function FamilyPreviewRoute() {
  return <FamilyPreviewPage />;
}
