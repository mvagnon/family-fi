import { zodResolver } from "@hookform/resolvers/zod";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import type { TFunction } from "i18next";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import type {
  CreateRecurringLineInput,
  FamilyCategory,
  RecurringLine,
} from "../domain/family";
import { recurringLineInputSchema } from "../domain/family";
import { useFamilyFormat } from "./use-family-format";

const recurrenceOptions = [1, 2, 3, 6, 12];
const customRecurrenceValue = "custom";

interface LineFormValidationMessages {
  amountNonZero: string;
  amountRequired: string;
  categoryRequired: string;
  customRecurrenceInvalid: string;
  estimateSameSign: string;
  maxNonZero: string;
  maxRequired: string;
  minNonZero: string;
  minRequired: string;
  recurrenceRequired: string;
  titleRequired: string;
}

function createLineFormBaseSchema(messages: LineFormValidationMessages) {
  return z.object({
    categoryId: requiredTextSchema(messages.categoryRequired),
    customRecurrenceMonths: z.string().optional(),
    description: z
      .string()
      .optional()
      .transform((value) => value?.trim() ?? ""),
    recurrenceChoice: requiredTextSchema(messages.recurrenceRequired),
    title: requiredTextSchema(messages.titleRequired),
  });
}

function createLineFormRawSchema(messages: LineFormValidationMessages) {
  const lineFormBaseSchema = createLineFormBaseSchema(messages);

  return z
    .discriminatedUnion("isEstimate", [
      lineFormBaseSchema.extend({
        amount: requiredNumberTextSchema(messages.amountRequired),
        isEstimate: z.literal(false),
        maxAmount: z.string().optional(),
        minAmount: z.string().optional(),
      }),
      lineFormBaseSchema.extend({
        amount: z.string().optional(),
        isEstimate: z.literal(true),
        maxAmount: requiredNumberTextSchema(messages.maxRequired),
        minAmount: requiredNumberTextSchema(messages.minRequired),
      }),
    ])
    .superRefine((values, context) => {
      if (
        values.recurrenceChoice === customRecurrenceValue &&
        !isPositiveIntegerText(values.customRecurrenceMonths)
      ) {
        context.addIssue({
          code: "custom",
          message: messages.customRecurrenceInvalid,
          path: ["customRecurrenceMonths"],
        });
      }

      if (!values.isEstimate) {
        if (values.amount === 0) {
          context.addIssue({
            code: "custom",
            message: messages.amountNonZero,
            path: ["amount"],
          });
        }

        return;
      }

      if (values.minAmount === 0) {
        context.addIssue({
          code: "custom",
          message: messages.minNonZero,
          path: ["minAmount"],
        });
      }

      if (values.maxAmount === 0) {
        context.addIssue({
          code: "custom",
          message: messages.maxNonZero,
          path: ["maxAmount"],
        });
      }

      if (
        values.minAmount !== 0 &&
        values.maxAmount !== 0 &&
        Math.sign(values.minAmount) !== Math.sign(values.maxAmount)
      ) {
        context.addIssue({
          code: "custom",
          message: messages.estimateSameSign,
          path: ["maxAmount"],
        });
      }
    });
}

function createLineFormSchema(messages: LineFormValidationMessages) {
  return createLineFormRawSchema(messages).transform((values, context) => {
    const result = recurringLineInputSchema.safeParse(
      toRecurringLineInput(values),
    );

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

type LineFormInput = z.input<ReturnType<typeof createLineFormSchema>>;
type LineFormValues = z.output<ReturnType<typeof createLineFormSchema>>;
type LineFormRawValues = z.output<ReturnType<typeof createLineFormRawSchema>>;

interface LineSelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

interface LineEditDialogProps {
  categoryFieldLabel?: string;
  categoryHelperText?: string;
  categoryOptions?: LineSelectOption[];
  categoryPlaceholder?: string;
  categories: FamilyCategory[];
  createTitle?: string;
  editTitle?: string;
  isSaving?: boolean;
  line: RecurringLine | null;
  mode: "create" | "edit";
  onClose: () => void;
  onSave: (line: RecurringLine) => Promise<void> | void;
  open: boolean;
}

interface VisibleLineEditDialog {
  line: RecurringLine;
  mode: LineEditDialogProps["mode"];
}

export function LineEditDialog({
  categoryFieldLabel,
  categoryHelperText,
  categoryOptions,
  categoryPlaceholder,
  categories,
  createTitle,
  editTitle,
  isSaving = false,
  line,
  mode,
  onClose,
  onSave,
  open,
}: LineEditDialogProps) {
  const [lastDialog, setLastDialog] = useState<VisibleLineEditDialog | null>(
    line ? { line, mode } : null,
  );
  const dialog = line ? { line, mode } : lastDialog;

  useEffect(() => {
    if (line) {
      setLastDialog({ line, mode });
    }
  }, [line, mode]);

  function handleExited() {
    if (!line) {
      setLastDialog(null);
    }
  }

  if (!dialog) {
    return null;
  }

  return (
    <LineEditDialogForm
      categoryFieldLabel={categoryFieldLabel}
      categoryHelperText={categoryHelperText}
      categoryOptions={categoryOptions}
      categoryPlaceholder={categoryPlaceholder}
      categories={categories}
      createTitle={createTitle}
      editTitle={editTitle}
      isSaving={isSaving}
      key={`${dialog.mode}-${dialog.line.id}`}
      line={dialog.line}
      mode={dialog.mode}
      onClose={onClose}
      onExited={handleExited}
      onSave={onSave}
      open={open}
    />
  );
}

function LineEditDialogForm({
  categoryFieldLabel,
  categoryHelperText,
  categoryOptions,
  categoryPlaceholder,
  categories,
  createTitle,
  editTitle,
  isSaving,
  line,
  mode,
  onClose,
  onExited,
  onSave,
  open,
}: Omit<LineEditDialogProps, "isSaving" | "line"> & {
  isSaving: boolean;
  line: RecurringLine;
  onExited: () => void;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const selectOptions: LineSelectOption[] =
    categoryOptions ??
    categories.map((category) => ({
      label: category.label,
      value: category.id,
    }));
  const lineFormSchema = useMemo(
    () => createLineFormSchema(getLineFormValidationMessages(t)),
    [t],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<LineFormInput, unknown, LineFormValues>({
    defaultValues: getLineFormDefaultValues(line),
    resolver: zodResolver(lineFormSchema),
    shouldFocusError: true,
  });
  const isEstimate = watch("isEstimate");
  const recurrenceChoice = watch("recurrenceChoice");
  const { ref: titleRef, ...titleField } = register("title");
  const { ref: customRecurrenceRef, ...customRecurrenceField } = register(
    "customRecurrenceMonths",
  );
  const { ref: amountRef, ...amountField } = register("amount");
  const { ref: minAmountRef, ...minAmountField } = register("minAmount");
  const { ref: maxAmountRef, ...maxAmountField } = register("maxAmount");
  const amountSlotProps = useMemo(
    () => getAmountSlotProps(familyFormat.currencySymbol),
    [familyFormat.currencySymbol],
  );

  function handleValidSubmit(values: LineFormValues) {
    return onSave({ ...line, ...values });
  }

  return (
    <FormDialog
      isSubmitting={isSaving}
      maxWidth="md"
      noValidate
      onClose={onClose}
      onExited={onExited}
      onSubmit={handleSubmit(handleValidSubmit)}
      open={open}
      cancelLabel={t("common.cancel")}
      submitLabel={mode === "create" ? t("common.add") : t("common.save")}
      title={
        mode === "create"
          ? (createTitle ?? t("family.line.createTitle"))
          : (editTitle ?? t("family.line.editTitle"))
      }
    >
      <Stack spacing={2.25} sx={{ pt: 1 }}>
        <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
          <TextField
            {...titleField}
            autoFocus
            disabled={isSaving}
            error={Boolean(errors.title)}
            fullWidth
            helperText={getFieldErrorMessage(errors.title)}
            id={`${line.id}-edit-title`}
            inputRef={titleRef}
            label={t("family.line.fields.title")}
            required
          />
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <TextField
                disabled={isSaving}
                error={Boolean(errors.categoryId)}
                fullWidth
                helperText={
                  getFieldErrorMessage(errors.categoryId) ?? categoryHelperText
                }
                id={`${line.id}-edit-category`}
                inputRef={field.ref}
                label={categoryFieldLabel ?? t("family.line.fields.category")}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                select
                value={field.value ?? ""}
              >
                <MenuItem disabled value="">
                  {categoryPlaceholder ?? t("family.line.selectCategory")}
                </MenuItem>
                {selectOptions.map((option) => (
                  <MenuItem
                    disabled={option.disabled}
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Stack>

        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <TextField
              disabled={isSaving}
              fullWidth
              id={`${line.id}-edit-description`}
              inputRef={field.ref}
              label={t("family.line.fields.description")}
              minRows={3}
              multiline
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value ?? ""}
            />
          )}
        />

        <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
          <Controller
            control={control}
            name="recurrenceChoice"
            render={({ field }) => (
              <TextField
                disabled={isSaving}
                error={Boolean(errors.recurrenceChoice)}
                fullWidth
                helperText={getFieldErrorMessage(errors.recurrenceChoice)}
                id={`${line.id}-edit-recurrence`}
                inputRef={field.ref}
                label={t("family.line.fields.recurrence")}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                select
                value={field.value ?? ""}
              >
                <MenuItem disabled value="">
                  {t("family.line.selectRecurrence")}
                </MenuItem>
                {recurrenceOptions.map((months) => (
                  <MenuItem key={months} value={String(months)}>
                    {familyFormat.formatRecurrence(months)}
                  </MenuItem>
                ))}
                <MenuItem value={customRecurrenceValue}>
                  {t("family.line.customRecurrence")}
                </MenuItem>
              </TextField>
            )}
          />
          {recurrenceChoice === customRecurrenceValue ? (
            <TextField
              {...customRecurrenceField}
              disabled={isSaving}
              error={Boolean(errors.customRecurrenceMonths)}
              fullWidth
              helperText={getFieldErrorMessage(errors.customRecurrenceMonths)}
              id={`${line.id}-edit-custom-recurrence`}
              inputRef={customRecurrenceRef}
              label={t("family.line.fields.customRecurrenceMonths")}
              required
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
            />
          ) : null}
        </Stack>

        <FormControlLabel
          control={
            <Controller
              control={control}
              name="isEstimate"
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  disabled={isSaving}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(event.target.checked)}
                  slotProps={{ input: { ref: field.ref } }}
                />
              )}
            />
          }
          label={t("family.line.useEstimate")}
        />

        {isEstimate ? (
          <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
            <TextField
              {...minAmountField}
              disabled={isSaving}
              error={Boolean(errors.minAmount)}
              fullWidth
              helperText={getFieldErrorMessage(errors.minAmount)}
              id={`${line.id}-edit-min-value`}
              inputRef={minAmountRef}
              label={t("family.line.fields.minAmount")}
              required
              slotProps={amountSlotProps}
            />
            <TextField
              {...maxAmountField}
              disabled={isSaving}
              error={Boolean(errors.maxAmount)}
              fullWidth
              helperText={getFieldErrorMessage(errors.maxAmount)}
              id={`${line.id}-edit-max-value`}
              inputRef={maxAmountRef}
              label={t("family.line.fields.maxAmount")}
              required
              slotProps={amountSlotProps}
            />
          </Stack>
        ) : (
          <TextField
            {...amountField}
            disabled={isSaving}
            error={Boolean(errors.amount)}
            fullWidth
            helperText={getFieldErrorMessage(errors.amount)}
            id={`${line.id}-edit-amount`}
            inputRef={amountRef}
            label={t("family.line.fields.amount")}
            required
            slotProps={amountSlotProps}
          />
        )}
      </Stack>
    </FormDialog>
  );
}

function getLineFormDefaultValues(line: RecurringLine): LineFormInput {
  const isPresetRecurrence = recurrenceOptions.includes(line.recurrenceMonths);
  const baseValues = {
    categoryId: line.categoryId,
    customRecurrenceMonths: isPresetRecurrence
      ? ""
      : String(line.recurrenceMonths),
    description: line.description,
    recurrenceChoice: isPresetRecurrence
      ? String(line.recurrenceMonths)
      : customRecurrenceValue,
    title: line.title,
  };

  if (line.isEstimate) {
    return {
      ...baseValues,
      amount: "",
      isEstimate: true,
      maxAmount: formatSignedAmount(line, line.maxAmount ?? line.amount),
      minAmount: formatSignedAmount(line, line.minAmount ?? line.amount),
    };
  }

  return {
    ...baseValues,
    amount: formatSignedAmount(line, line.amount),
    isEstimate: false,
    maxAmount: "",
    minAmount: "",
  };
}

function toRecurringLineInput(
  values: LineFormRawValues,
): CreateRecurringLineInput {
  if (!values.isEstimate) {
    return {
      amount: Math.abs(values.amount),
      categoryId: values.categoryId,
      description: values.description,
      isEstimate: false,
      movement: getMovementFromSignedAmount(values.amount),
      recurrenceMonths: getRecurrenceMonths(values),
      title: values.title,
    };
  }

  const minAmount = Math.min(
    Math.abs(values.minAmount),
    Math.abs(values.maxAmount),
  );
  const maxAmount = Math.max(
    Math.abs(values.minAmount),
    Math.abs(values.maxAmount),
  );

  return {
    amount: (minAmount + maxAmount) / 2,
    categoryId: values.categoryId,
    description: values.description,
    isEstimate: true,
    maxAmount,
    minAmount,
    movement: getMovementFromSignedAmount(values.minAmount),
    recurrenceMonths: getRecurrenceMonths(values),
    title: values.title,
  };
}

function getRecurrenceMonths(values: LineFormRawValues): number {
  return values.recurrenceChoice === customRecurrenceValue
    ? Number(values.customRecurrenceMonths)
    : Number(values.recurrenceChoice);
}

function isPositiveIntegerText(value: string | undefined): boolean {
  const months = Number(value?.trim());

  return Number.isInteger(months) && months > 0;
}

function getLineFormValidationMessages(
  t: TFunction,
): LineFormValidationMessages {
  return {
    amountNonZero: t("family.line.validation.amountNonZero"),
    amountRequired: t("family.line.validation.amountRequired"),
    categoryRequired: t("family.line.validation.categoryRequired"),
    customRecurrenceInvalid: t(
      "family.line.validation.customRecurrenceInvalid",
    ),
    estimateSameSign: t("family.line.validation.estimateSameSign"),
    maxNonZero: t("family.line.validation.maxNonZero"),
    maxRequired: t("family.line.validation.maxRequired"),
    minNonZero: t("family.line.validation.minNonZero"),
    minRequired: t("family.line.validation.minRequired"),
    recurrenceRequired: t("family.line.validation.recurrenceRequired"),
    titleRequired: t("family.line.validation.titleRequired"),
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

function formatSignedAmount(line: RecurringLine, amount: number): string {
  const signedAmount = line.movement === "positive" ? amount : -amount;

  return signedAmount === 0 ? "" : String(signedAmount);
}

function getMovementFromSignedAmount(amount: number): "positive" | "negative" {
  return amount > 0 ? "positive" : "negative";
}

function getFieldErrorMessage(error: { message?: unknown } | undefined) {
  return typeof error?.message === "string" ? error.message : undefined;
}

function getAmountSlotProps(currencySymbol: string) {
  return {
    htmlInput: {
      inputMode: "decimal",
    },
    input: {
      startAdornment: (
        <InputAdornment position="start">{currencySymbol}</InputAdornment>
      ),
    },
  } as const;
}
