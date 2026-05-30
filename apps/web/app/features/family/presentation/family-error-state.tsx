import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import { LoadingButton } from "@repo/ui/loading-button";
import { PageShell } from "@repo/ui/page-shell";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import { FamilySidebarNavigation } from "./family-sidebar-navigation";

interface FamilyErrorStateProps {
  isRetrying: boolean;
  message: string;
  onRetry: () => void;
}

export function FamilyErrorState({
  isRetrying,
  message,
  onRetry,
}: FamilyErrorStateProps) {
  const { t } = useTranslation();

  return (
    <PageShell navigation={<FamilySidebarNavigation />}>
      <SectionPanel
        action={
          <LoadingButton
            isLoading={isRetrying}
            onClick={onRetry}
            startIcon={<RefreshIcon />}
            variant="contained"
          >
            {t("common.retry")}
          </LoadingButton>
        }
        contentSx={{ p: { md: 2.5, xs: 2 } }}
        subtitle={t("family.error.unavailableSubtitle")}
        title={t("family.error.unavailableTitle")}
        titleId="family-error-title"
      >
        <Alert severity="error" variant="outlined">
          {message}
        </Alert>
      </SectionPanel>
    </PageShell>
  );
}
