import RefreshIcon from "@mui/icons-material/Refresh";
import Alert from "@mui/material/Alert";
import { LoadingButton } from "@repo/ui/loading-button";
import { PageShell } from "@repo/ui/page-shell";
import { SectionPanel } from "@repo/ui/section-panel";

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
            Réessayer
          </LoadingButton>
        }
        contentSx={{ p: { md: 2.5, xs: 2 } }}
        subtitle="La configuration du foyer n'a pas pu être récupérée."
        title="Foyer indisponible"
        titleId="family-error-title"
      >
        <Alert severity="error" variant="outlined">
          {message}
        </Alert>
      </SectionPanel>
    </PageShell>
  );
}
