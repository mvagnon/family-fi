import type { FormEvent } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import { useTranslation } from "react-i18next";

import type { CreateFamilyCategoryInput } from "../domain/family";
import { getFormTextValue } from "./family-form-values";

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
  const { t } = useTranslation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSave({
      label: getFormTextValue(formData, "label"),
    });
  }

  return (
    <FormDialog
      isSubmitting={isSaving}
      cancelLabel={t("common.cancel")}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      submitLabel={t("common.add")}
      title={t("family.categoryModal.title")}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          autoFocus
          disabled={isSaving}
          fullWidth
          id="new-category-label"
          label={t("family.categoryModal.label")}
          name="label"
        />
      </Stack>
    </FormDialog>
  );
}
