import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { useMemo } from "react";
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
import {
  getAmountSlotProps,
  getFieldErrorMessage,
  requiredIntegerTextSchema,
  requiredNumberTextSchema,
  requiredTextSchema,
} from "./family-form-fields";
import { useFamilyFormat } from "./use-family-format";

interface ParticipationLineFormValidationMessages {
  amountNonZero: string;
  amountRequired: string;
  monthFuture: string;
  memberRequired: string;
  monthRequired: string;
  yearFuture: string;
  yearRequired: string;
}

function createParticipationLineFormSchema(
  messages: ParticipationLineFormValidationMessages,
  currentMonthIndex: number,
  currentYear: number,
) {
  return z
    .object({
      amount: requiredNumberTextSchema(messages.amountRequired).refine(
        (value) => value !== 0,
        { message: messages.amountNonZero },
      ),
      memberId: requiredTextSchema(messages.memberRequired),
      month: requiredIntegerTextSchema(messages.monthRequired).refine(
        (value) => value >= 1 && value <= 12,
        { message: messages.monthRequired },
      ),
      title: z.string().optional(),
      year: requiredIntegerTextSchema(messages.yearRequired)
        .refine((value) => value > 0, { message: messages.yearRequired })
        .refine((value) => value <= currentYear, {
          message: messages.yearFuture,
        }),
    })
    .superRefine((values, context) => {
      if (values.year === currentYear && values.month > currentMonthIndex + 1) {
        context.addIssue({
          code: "custom",
          message: messages.monthFuture,
          path: ["month"],
        });
      }
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
  currentMonthIndex: number;
  currentYear: number;
  defaultMemberId: string;
  defaultYear: number;
  initialLine?: CreateParticipationLineInput;
  isSaving?: boolean;
  members: FamilyMember[];
  mode?: "create" | "edit";
  onClose: () => void;
  onSave: (line: CreateParticipationLineInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyParticipationLineModal({
  currentMonthIndex,
  currentYear,
  defaultMemberId,
  defaultYear,
  initialLine,
  isSaving = false,
  members,
  mode = "create",
  onClose,
  onSave,
  open,
}: FamilyParticipationLineModalProps) {
  const { i18n, t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const formSchema = useMemo(
    () =>
      createParticipationLineFormSchema(
        getParticipationLineFormValidationMessages(t),
        currentMonthIndex,
        currentYear,
      ),
    [currentMonthIndex, currentYear, t],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<ParticipationLineFormInput, unknown, ParticipationLineFormValues>(
    {
      defaultValues: {
        amount: initialLine ? String(initialLine.amount) : "",
        memberId: initialLine?.memberId ?? defaultMemberId,
        month: String(initialLine?.month ?? currentMonthIndex + 1),
        title: initialLine?.title ?? "",
        year: String(initialLine?.year ?? defaultYear),
      },
      resolver: zodResolver(formSchema),
      shouldFocusError: true,
      shouldUnregister: true,
    },
  );
  const { ref: amountRef, ...amountField } = register("amount");
  const { ref: titleRef, ...titleField } = register("title");
  const { ref: yearRef, ...yearField } = register("year");
  const selectedYear = Number(watch("year"));
  const monthLabelYear = Number.isFinite(selectedYear)
    ? selectedYear
    : currentYear;
  const monthOptionCount =
    selectedYear === currentYear ? currentMonthIndex + 1 : 12;
  const monthFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
        month: "long",
      }),
    [i18n.language, i18n.resolvedLanguage],
  );
  const amountSlotProps = useMemo(
    () => getAmountSlotProps(familyFormat.currencySymbol),
    [familyFormat.currencySymbol],
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
      submitLabel={mode === "create" ? t("common.add") : t("common.save")}
      title={
        mode === "create"
          ? t("participations.creation.title")
          : t("participations.creation.editTitle")
      }
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
              {members.map((member) => (
                <MenuItem
                  disabled={!member.isActive}
                  key={member.id}
                  value={member.id}
                >
                  {member.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          {...titleField}
          disabled={isSaving}
          error={Boolean(errors.title)}
          fullWidth
          helperText={getFieldErrorMessage(errors.title)}
          id="participation-line-title"
          inputRef={titleRef}
          label={t("participations.creation.titleField")}
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
                {Array.from({ length: monthOptionCount }, (_, index) => {
                  const month = index + 1;

                  return (
                    <MenuItem key={month} value={String(month)}>
                      {monthFormatter.format(
                        new Date(monthLabelYear, index, 1),
                      )}
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
    amountNonZero: t("participations.creation.validation.amountNonZero"),
    amountRequired: t("participations.creation.validation.amountRequired"),
    monthFuture: t("participations.creation.validation.monthFuture"),
    memberRequired: t("participations.creation.validation.memberRequired"),
    monthRequired: t("participations.creation.validation.monthRequired"),
    yearFuture: t("participations.creation.validation.yearFuture"),
    yearRequired: t("participations.creation.validation.yearRequired"),
  };
}
