import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { FamilyPageShell } from "./family-page-shell";

interface FamilyErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function FamilyErrorState({ message, onRetry }: FamilyErrorStateProps) {
  return (
    <FamilyPageShell>
      <Alert
        action={
          <Button color="inherit" onClick={onRetry} size="small">
            Réessayer
          </Button>
        }
        severity="error"
      >
        {message}
      </Alert>
    </FamilyPageShell>
  );
}
