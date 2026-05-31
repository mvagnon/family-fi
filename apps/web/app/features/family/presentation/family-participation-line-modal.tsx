import type { FormEvent } from "react";
import { useMemo } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import { useTranslation } from "react-i18next";

import type {
  CreateParticipationLineInput,
  FamilyMember,
} from "../domain/family";
import { getFormTextValue } from "./family-form-values";

interface FamilyParticipationLineModalProps {
  activeMembers: FamilyMember[];
  currentYear: number;
  defaultMemberId: string;
  defaultYear: number;
  isSaving?: boolean;
  onClose: () => void;
  onSave: (line: CreateParticipationLineInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyParticipationLineModal({
  activeMembers,
  currentYear,
  defaultMemberId,
  defaultYear,
  isSaving = false,
  onClose,
  onSave,
  open,
}: FamilyParticipationLineModalProps) {
  const { i18n, t } = useTranslation();
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        month: "long",
      }),
    [i18n.language, i18n.resolvedLanguage],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const amount = Number(
      getFormTextValue(formData, "amount").replace(",", "."),
    );

    onSave({
      amount,
      memberId: getFormTextValue(formData, "memberId"),
      month: Number(getFormTextValue(formData, "month")),
      year: Number(getFormTextValue(formData, "year")),
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
      title={t("participations.creation.title")}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          disabled={isSaving}
          defaultValue={defaultMemberId}
          fullWidth
          label={t("participations.creation.memberField")}
          name="memberId"
          required
          select
        >
          {activeMembers.map((member) => (
            <MenuItem key={member.id} value={member.id}>
              {member.name}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
          <TextField
            defaultValue={defaultYear}
            disabled={isSaving}
            fullWidth
            label={t("participations.creation.year")}
            name="year"
            required
            type="number"
            slotProps={{
              htmlInput: {
                max: currentYear,
                min: 1,
                step: 1,
              },
            }}
          />
          <TextField
            defaultValue={String(new Date().getMonth() + 1)}
            disabled={isSaving}
            fullWidth
            label={t("participations.creation.month")}
            name="month"
            required
            select
          >
            {Array.from({ length: 12 }, (_, index) => {
              const month = index + 1;

              return (
                <MenuItem key={month} value={String(month)}>
                  {monthFormatter.format(new Date(defaultYear, index, 1))}
                </MenuItem>
              );
            })}
          </TextField>
        </Stack>

        <TextField
          autoFocus
          disabled={isSaving}
          fullWidth
          label={t("participations.creation.amount")}
          name="amount"
          required
          slotProps={{
            htmlInput: {
              inputMode: "decimal",
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">€</InputAdornment>
              ),
            },
          }}
        />
      </Stack>
    </FormDialog>
  );
}
