import { useTranslation } from "react-i18next";

import { AppShellHeader } from "../../app-shell/presentation/app-shell-layout";

export function DashboardPage() {
  const { t } = useTranslation();

  return <AppShellHeader title={t("dashboard.page.title")} />;
}
