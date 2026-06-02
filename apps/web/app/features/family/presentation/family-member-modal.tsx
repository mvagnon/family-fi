import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import type { CreateFamilyMemberInput, FamilyMember } from "../domain/family";
import { getFormTextValue } from "./family-form-values";

interface FamilyMemberModalProps {
  initialMember?: FamilyMember | null;
  isSaving?: boolean;
  mode?: "create" | "edit";
  onClose: () => void;
  onSave: (member: CreateFamilyMemberInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyMemberModal({
  initialMember = null,
  isSaving = false,
  mode = "create",
  onClose,
  onSave,
  open,
}: FamilyMemberModalProps) {
  const { t } = useTranslation();
  const isEditMode = mode === "edit";
  const formKey =
    isEditMode && initialMember ? `edit-${initialMember.id}` : "create";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    onSave({
      isActive: formData.get("isActive") === "on",
      name: getFormTextValue(formData, "name"),
    });
  }

  return (
    <FormDialog
      cancelLabel={t("common.cancel")}
      isSubmitting={isSaving}
      key={formKey}
      onClose={onClose}
      onSubmit={handleSubmit}
      open={open}
      submitLabel={t(isEditMode ? "common.save" : "common.add")}
      title={t(
        isEditMode
          ? "family.memberModal.editTitle"
          : "family.memberModal.title",
      )}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          autoFocus
          defaultValue={initialMember?.name ?? ""}
          disabled={isSaving}
          fullWidth
          id="member-name"
          label={t("family.memberModal.label")}
          name="name"
        />
        <FormControl disabled={isSaving}>
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={initialMember?.isActive ?? true}
                disabled={isSaving}
                name="isActive"
              />
            }
            label={t("family.memberModal.isActive")}
          />
          <FormHelperText sx={{ ml: 0, mt: 0.5 }}>
            {t("family.memberModal.isActiveHelper")}
          </FormHelperText>
        </FormControl>
      </Stack>
    </FormDialog>
  );
}
