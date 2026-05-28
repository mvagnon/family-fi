import type { FormEvent } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";

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
    <FormDialog
      isSubmitting={isSaving}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      submitLabel="Ajouter"
      title="Ajouter un membre"
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
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
