import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import type { SxProps, Theme } from "@mui/material/styles";
import { LoadingButton } from "@repo/ui/loading-button";
import { SectionPanel } from "@repo/ui/section-panel";
import { useTranslation } from "react-i18next";

import { AppShellContent } from "../../app-shell/presentation/app-shell-layout";

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
    <AppShellContent sx={familyErrorContentSx}>
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
    </AppShellContent>
  );
}

const familyErrorContentSx = {
  gridColumn: {
    lg: 1,
    xl: 2,
  },
  gridRow: {
    lg: 1,
    xs: 2,
  },
} satisfies SxProps<Theme>;
