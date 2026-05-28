import Button from "@mui/material/Button";

import { FamilyErrorSnackbar } from "./family-error-snackbar";
import { FamilyPageShell } from "./family-page-shell";

interface FamilyErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function FamilyErrorState({ message, onRetry }: FamilyErrorStateProps) {
  return (
    <FamilyPageShell>
      <FamilyErrorSnackbar
        action={
          <Button color="inherit" onClick={onRetry} size="small">
            Réessayer
          </Button>
        }
        autoHideDuration={null}
        message={message}
      />
    </FamilyPageShell>
  );
}
