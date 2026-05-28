import type { FormEvent } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import type { FamilyCategory } from "./types";

interface FamilyCategoryModalProps {
  onClose: () => void;
  onSave: (category: FamilyCategory) => void;
  open: boolean;
}

export function FamilyCategoryModal({
  onClose,
  onSave,
  open,
}: FamilyCategoryModalProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const label = getStringValue(formData, "label", "Nouvelle catégorie");

    onSave({
      id: createCategoryId(label),
      kind: "shared",
      label,
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
            fullWidth
            id="new-category-label"
            label="Nom"
            name="label"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} type="button">
          Annuler
        </Button>
        <Button form="new-category-form" type="submit" variant="contained">
          Ajouter
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function createCategoryId(label: string): string {
  const normalizedLabel = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${normalizedLabel || "category"}-${Date.now()}`;
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
