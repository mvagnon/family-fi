import { ConfigurationPage } from "~/features/configuration/presentation/configuration-page";
import { spacesHttpRepository } from "~/features/spaces/infrastructure/spaces-http-repository";
import i18n from "~/i18n";

import type { Route } from "./+types/configuration";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("configuration.meta.title") },
    {
      name: "description",
      content: i18n.t("configuration.meta.description"),
    },
  ];
}

export default function ConfigurationRoute() {
  return <ConfigurationPage spaceRepository={spacesHttpRepository} />;
}
