import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import type {
  CreateParticipationLineInput,
  FamilyMember,
} from "../domain/family";
import { participationLineInputSchema } from "../domain/family";

interface ParticipationLineFormValidationMessages {
  amountPositive: string;
  amountRequired: string;
  memberRequired: string;
  monthRequired: string;
  yearFuture: string;
  yearRequired: string;
}

function createParticipationLineFormSchema(
  messages: ParticipationLineFormValidationMessages,
  currentYear: number,
) {
  return z
    .object({
      amount: requiredNumberTextSchema(messages.amountRequired).refine(
        (value) => value > 0,
        { message: messages.amountPositive },
      ),
      memberId: requiredTextSchema(messages.memberRequired),
      month: requiredIntegerTextSchema(messages.monthRequired).refine(
        (value) => value >= 1 && value <= 12,
        { message: messages.monthRequired },
      ),
      year: requiredIntegerTextSchema(messages.yearRequired)
        .refine((value) => value > 0, { message: messages.yearRequired })
        .refine((value) => value <= currentYear, {
          message: messages.yearFuture,
        }),
    })
    .transform((values, context) => {
      const result = participationLineInputSchema.safeParse(values);

      if (!result.success) {
        for (const issue of result.error.issues) {
          context.addIssue({
            code: "custom",
            message: issue.message,
            path: issue.path,
          });
        }

        return z.NEVER;
      }

      return result.data;
    });
}

type ParticipationLineFormInput = z.input<
  ReturnType<typeof createParticipationLineFormSchema>
>;
type ParticipationLineFormValues = z.output<
  ReturnType<typeof createParticipationLineFormSchema>
>;

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
  const formSchema = useMemo(
    () =>
      createParticipationLineFormSchema(
        getParticipationLineFormValidationMessages(t),
        currentYear,
      ),
    [currentYear, t],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<ParticipationLineFormInput, unknown, ParticipationLineFormValues>(
    {
      defaultValues: {
        amount: "",
        memberId: defaultMemberId,
        month: String(new Date().getMonth() + 1),
        year: String(defaultYear),
      },
      resolver: zodResolver(formSchema),
      shouldFocusError: true,
      shouldUnregister: true,
    },
  );
  const { ref: amountRef, ...amountField } = register("amount");
  const { ref: yearRef, ...yearField } = register("year");
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        month: "long",
      }),
    [i18n.language, i18n.resolvedLanguage],
  );

  function handleValidSubmit(values: ParticipationLineFormValues) {
    return onSave(values);
  }

  return (
    <FormDialog
      isSubmitting={isSaving}
      cancelLabel={t("common.cancel")}
      noValidate
      onClose={onClose}
      onSubmit={handleSubmit(handleValidSubmit)}
      open={open}
      submitLabel={t("common.add")}
      title={t("participations.creation.title")}
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Controller
          control={control}
          name="memberId"
          render={({ field }) => (
            <TextField
              disabled={isSaving}
              error={Boolean(errors.memberId)}
              fullWidth
              helperText={getFieldErrorMessage(errors.memberId)}
              id="participation-line-member"
              inputRef={field.ref}
              label={t("participations.creation.memberField")}
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              required
              select
              value={field.value ?? ""}
            >
              {activeMembers.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
          <TextField
            {...yearField}
            disabled={isSaving}
            error={Boolean(errors.year)}
            fullWidth
            helperText={getFieldErrorMessage(errors.year)}
            id="participation-line-year"
            inputRef={yearRef}
            label={t("participations.creation.year")}
            required
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                max: currentYear,
                min: 1,
                step: 1,
              },
            }}
          />
          <Controller
            control={control}
            name="month"
            render={({ field }) => (
              <TextField
                disabled={isSaving}
                error={Boolean(errors.month)}
                fullWidth
                helperText={getFieldErrorMessage(errors.month)}
                id="participation-line-month"
                inputRef={field.ref}
                label={t("participations.creation.month")}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                select
                value={field.value ?? ""}
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
            )}
          />
        </Stack>

        <TextField
          {...amountField}
          autoFocus
          disabled={isSaving}
          error={Boolean(errors.amount)}
          fullWidth
          helperText={getFieldErrorMessage(errors.amount)}
          id="participation-line-amount"
          inputRef={amountRef}
          label={t("participations.creation.amount")}
          required
          slotProps={amountSlotProps}
        />
      </Stack>
    </FormDialog>
  );
}

function getParticipationLineFormValidationMessages(
  t: TFunction,
): ParticipationLineFormValidationMessages {
  return {
    amountPositive: t("participations.creation.validation.amountPositive"),
    amountRequired: t("participations.creation.validation.amountRequired"),
    memberRequired: t("participations.creation.validation.memberRequired"),
    monthRequired: t("participations.creation.validation.monthRequired"),
    yearFuture: t("participations.creation.validation.yearFuture"),
    yearRequired: t("participations.creation.validation.yearRequired"),
  };
}

function requiredTextSchema(message: string) {
  return z.string({ error: message }).trim().min(1, { message });
}

function requiredNumberTextSchema(message: string) {
  return z
    .string({ error: message })
    .trim()
    .min(1, { message })
    .transform((value) => Number(value.replace(",", ".")))
    .refine((value) => Number.isFinite(value), { message });
}

function requiredIntegerTextSchema(message: string) {
  return requiredNumberTextSchema(message).refine(Number.isInteger, {
    message,
  });
}

function getFieldErrorMessage(error: { message?: unknown } | undefined) {
  return typeof error?.message === "string" ? error.message : undefined;
}

const amountSlotProps = {
  htmlInput: {
    inputMode: "decimal",
  },
  input: {
    startAdornment: <InputAdornment position="start">€</InputAdornment>,
  },
} as const;
