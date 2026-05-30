import { FamilyPreviewPage } from "~/features/family/presentation/family-preview-page";
import i18n from "~/i18n";

export function meta() {
  return [
    { title: i18n.t("family.meta.previewTitle") },
    {
      name: "description",
      content: i18n.t("family.meta.previewDescription"),
    },
  ];
}

export default function FamilyPreviewRoute() {
  return <FamilyPreviewPage />;
}
