import type { FormEvent } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import type { CreateFamilyCategoryInput } from "../domain/family";

interface FamilyCategoryModalProps {
  isSaving?: boolean;
  onClose: () => void;
  onSave: (category: CreateFamilyCategoryInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyCategoryModal({
  isSaving = false,
  onClose,
  onSave,
  open,
}: FamilyCategoryModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSave({
      label: getStringValue(formData, "label", "Nouvelle catégorie"),
    });
  }

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Ajouter une catégorie</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="new-category-form"
          onSubmit={handleSubmit}
          spacing={2}
          sx={{ pt: 1 }}
        >
          <TextField
            autoFocus
            defaultValue="Nouvelle catégorie"
            disabled={isSaving}
            fullWidth
            id="new-category-label"
            label="Nom"
            name="label"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSaving} onClick={onClose} type="button">
          Annuler
        </Button>
        <Button
          disabled={isSaving}
          form="new-category-form"
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
