import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

interface DangerousActionConfirmationDialogProps {
  actionLabel?: string;
  cancelLabel?: string;
  description: string;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void> | void;
  open: boolean;
  title: string;
}

export function DangerousActionConfirmationDialog({
  actionLabel = "Supprimer",
  cancelLabel = "Annuler",
  description,
  isPending = false,
  onCancel,
  onConfirm,
  open,
  title,
}: DangerousActionConfirmationDialogProps) {
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      onClose={isPending ? undefined : onCancel}
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="error"
          disabled={isPending}
          onClick={onConfirm}
          startIcon={
            isPending ? (
              <CircularProgress color="inherit" size={16} />
            ) : undefined
          }
          variant="contained"
        >
          {actionLabel}
        </Button>
        <Button autoFocus disabled={isPending} onClick={onCancel}>
          {cancelLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
