import type { FormEvent } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";

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
    <FormDialog
      isSubmitting={isSaving}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      submitLabel="Ajouter"
      title="Ajouter une catégorie"
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
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
    </FormDialog>
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
