import type { ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import type { DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { ButtonProps } from "@mui/material/Button";

import { LoadingButton } from "./loading-button";

interface ConfirmationDialogProps {
  cancelLabel?: string;
  confirmColor?: ButtonProps["color"];
  confirmFirst?: boolean;
  confirmLabel?: string;
  description: ReactNode;
  isPending?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  open: boolean;
  title: ReactNode;
}

export function ConfirmationDialog({
  cancelLabel = "Annuler",
  confirmColor = "primary",
  confirmFirst = false,
  confirmLabel = "Confirmer",
  description,
  isPending = false,
  maxWidth = "xs",
  onCancel,
  onConfirm,
  open,
  title,
}: ConfirmationDialogProps) {
  const cancelAction = (
    <LoadingButton
      autoFocus={!confirmFirst}
      disabled={isPending}
      key="cancel"
      onClick={onCancel}
      type="button"
    >
      {cancelLabel}
    </LoadingButton>
  );
  const confirmAction = (
    <LoadingButton
      autoFocus={confirmFirst}
      color={confirmColor}
      isLoading={isPending}
      key="confirm"
      onClick={onConfirm}
      type="button"
      variant="contained"
    >
      {confirmLabel}
    </LoadingButton>
  );

  return (
    <Dialog
      fullWidth
      maxWidth={maxWidth}
      onClose={isPending ? undefined : onCancel}
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {confirmFirst
          ? [confirmAction, cancelAction]
          : [cancelAction, confirmAction]}
      </DialogActions>
    </Dialog>
  );
}
