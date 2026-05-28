import type { FormEvent } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import type { CreateFamilyMemberInput } from "../domain/family";

interface FamilyMemberModalProps {
  isSaving?: boolean;
  onClose: () => void;
  onSave: (member: CreateFamilyMemberInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyMemberModal({
  isSaving = false,
  onClose,
  onSave,
  open,
}: FamilyMemberModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSave({
      name: getStringValue(formData, "name", "Camille"),
    });
  }

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Ajouter un membre</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="new-member-form"
          onSubmit={handleSubmit}
          spacing={2}
          sx={{ pt: 1 }}
        >
          <TextField
            autoFocus
            defaultValue="Camille"
            disabled={isSaving}
            fullWidth
            id="new-member-name"
            label="Nom"
            name="name"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSaving} onClick={onClose}>
          Annuler
        </Button>
        <Button
          disabled={isSaving}
          form="new-member-form"
          startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
          type="submit"
          variant="contained"
        >
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function getStringValue(
  formData: FormData,
  name: string,
  fallback: string,
): string {
  const value = formData.get(name);

  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim() || fallback;
}
