import { DashboardPage } from "~/features/dashboard/presentation/dashboard-page";
import i18n from "~/i18n";

import type { Route } from "./+types/dashboard";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("dashboard.meta.title") },
    {
      name: "description",
      content: i18n.t("dashboard.meta.description"),
    },
  ];
}

export default function DashboardRoute() {
  return <DashboardPage />;
}
