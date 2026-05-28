import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

interface FamilyErrorSnackbarProps {
  action?: ReactNode;
  autoHideDuration?: number | null;
  message?: string;
}

export function FamilyErrorSnackbar({
  action,
  autoHideDuration = 6000,
  message,
}: FamilyErrorSnackbarProps) {
  const [open, setOpen] = useState(Boolean(message));

  useEffect(() => {
    if (message) {
      setOpen(true);
    }
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <Snackbar
      anchorOrigin={{ horizontal: "center", vertical: "bottom" }}
      autoHideDuration={autoHideDuration}
      onClose={(_, reason) => {
        if (reason !== "clickaway") {
          setOpen(false);
        }
      }}
      open={open}
    >
      <Alert
        action={action}
        onClose={action ? undefined : () => setOpen(false)}
        severity="error"
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
