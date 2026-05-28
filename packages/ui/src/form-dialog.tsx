import type { FormEventHandler, ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import type { DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import type { SxProps, Theme } from "@mui/material/styles";

import { LoadingButton } from "./loading-button";

interface FormDialogProps {
  cancelLabel?: ReactNode;
  children: ReactNode;
  contentSx?: SxProps<Theme>;
  isSubmitting?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  open: boolean;
  submitLabel: ReactNode;
  title: ReactNode;
}

export function FormDialog({
  cancelLabel = "Annuler",
  children,
  contentSx,
  isSubmitting = false,
  maxWidth = "sm",
  onClose,
  onSubmit,
  open,
  submitLabel,
  title,
}: FormDialogProps) {
  return (
    <Dialog
      fullWidth
      maxWidth={maxWidth}
      onClose={isSubmitting ? undefined : onClose}
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent sx={contentSx}>{children}</DialogContent>
        <DialogActions>
          <Button disabled={isSubmitting} onClick={onClose} type="button">
            {cancelLabel}
          </Button>
          <LoadingButton
            isLoading={isSubmitting}
            type="submit"
            variant="contained"
          >
            {submitLabel}
          </LoadingButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
