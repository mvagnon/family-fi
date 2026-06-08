import ConstructionIcon from "@mui/icons-material/Construction";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useTranslation } from "react-i18next";

import {
  AppShellContent,
  AppShellHeader,
} from "../../app-shell/presentation/app-shell-layout";

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <>
      <AppShellHeader title={t("dashboard.page.title")} />
      <AppShellContent>
        <Alert
          icon={<ConstructionIcon fontSize="inherit" />}
          severity="info"
          sx={{ maxWidth: 680 }}
          variant="outlined"
        >
          <AlertTitle>{t("dashboard.page.workInProgressTitle")}</AlertTitle>
          {t("dashboard.page.workInProgressMessage")}
        </Alert>
      </AppShellContent>
    </>
  );
}
