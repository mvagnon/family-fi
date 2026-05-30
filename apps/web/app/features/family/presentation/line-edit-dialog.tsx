import { zodResolver } from "@hookform/resolvers/zod";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import type {
  CreateRecurringLineInput,
  FamilyCategory,
  RecurringLine,
} from "../domain/family";
import { recurringLineInputSchema } from "../domain/family";
import { formatRecurrence } from "./family-format";

const recurrenceOptions = [1, 2, 3, 6, 12];

const lineFormBaseSchema = z.object({
  categoryId: requiredTextSchema("La catégorie est obligatoire."),
  description: z
    .string()
    .optional()
    .transform((value) => value?.trim() ?? ""),
  recurrenceMonths: requiredNumberTextSchema(
    "La récurrence est obligatoire.",
  ).refine((value) => value > 0, {
    message: "La récurrence est obligatoire.",
  }),
  title: requiredTextSchema("L'intitulé est obligatoire."),
});

const lineFormRawSchema = z
  .discriminatedUnion("isEstimate", [
    lineFormBaseSchema.extend({
      amount: requiredNumberTextSchema("Le montant est obligatoire."),
      isEstimate: z.literal(false),
      maxAmount: z.string().optional(),
      minAmount: z.string().optional(),
    }),
    lineFormBaseSchema.extend({
      amount: z.string().optional(),
      isEstimate: z.literal(true),
      maxAmount: requiredNumberTextSchema(
        "La valeur maximale est obligatoire.",
      ),
      minAmount: requiredNumberTextSchema(
        "La valeur minimale est obligatoire.",
      ),
    }),
  ])
  .superRefine((values, context) => {
    if (!values.isEstimate) {
      if (values.amount === 0) {
        context.addIssue({
          code: "custom",
          message: "Le montant doit être différent de 0.",
          path: ["amount"],
        });
      }

      return;
    }

    if (values.minAmount === 0) {
      context.addIssue({
        code: "custom",
        message: "La valeur minimale doit être différente de 0.",
        path: ["minAmount"],
      });
    }

    if (values.maxAmount === 0) {
      context.addIssue({
        code: "custom",
        message: "La valeur maximale doit être différente de 0.",
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
        message: "Les valeurs minimale et maximale doivent avoir le même signe.",
        path: ["maxAmount"],
      });
    }
  });

const lineFormSchema = lineFormRawSchema.transform((values, context) => {
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

type LineFormInput = z.input<typeof lineFormSchema>;
type LineFormValues = z.output<typeof lineFormSchema>;

interface LineEditDialogProps {
  categories: FamilyCategory[];
  isSaving?: boolean;
  line: RecurringLine | null;
  mode: "create" | "edit";
  onClose: () => void;
  onSave: (line: RecurringLine) => Promise<void> | void;
  open: boolean;
}

export function LineEditDialog({
  categories,
  isSaving = false,
  line,
  mode,
  onClose,
  onSave,
  open,
}: LineEditDialogProps) {
  if (!line) {
    return null;
  }

  return (
    <LineEditDialogForm
      categories={categories}
      isSaving={isSaving}
      key={`${mode}-${line.id}`}
      line={line}
      mode={mode}
      onClose={onClose}
      onSave={onSave}
      open={open}
    />
  );
}

function LineEditDialogForm({
  categories,
  isSaving,
  line,
  mode,
  onClose,
  onSave,
  open,
}: Omit<LineEditDialogProps, "isSaving" | "line"> & {
  isSaving: boolean;
  line: RecurringLine;
}) {
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
    shouldUnregister: true,
  });
  const isEstimate = watch("isEstimate");
  const { ref: titleRef, ...titleField } = register("title");
  const { ref: amountRef, ...amountField } = register("amount");
  const { ref: minAmountRef, ...minAmountField } = register("minAmount");
  const { ref: maxAmountRef, ...maxAmountField } = register("maxAmount");

  function handleValidSubmit(values: LineFormValues) {
    return onSave({ ...line, ...values });
  }

  return (
    <FormDialog
      isSubmitting={isSaving}
      maxWidth="md"
      noValidate
      onClose={onClose}
      onSubmit={handleSubmit(handleValidSubmit)}
      open={open}
      submitLabel={mode === "create" ? "Ajouter" : "Enregistrer"}
      title={mode === "create" ? "Ajouter une ligne" : "Modifier une ligne"}
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
            label="Intitulé"
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
                helperText={getFieldErrorMessage(errors.categoryId)}
                id={`${line.id}-edit-category`}
                inputRef={field.ref}
                label="Catégorie"
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                required
                select
                value={field.value ?? ""}
              >
                <MenuItem disabled value="">
                  Sélectionner une catégorie
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.label}
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
              label="Description"
              minRows={3}
              multiline
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              value={field.value ?? ""}
            />
          )}
        />

        <Controller
          control={control}
          name="recurrenceMonths"
          render={({ field }) => (
            <TextField
              disabled={isSaving}
              error={Boolean(errors.recurrenceMonths)}
              fullWidth
              helperText={getFieldErrorMessage(errors.recurrenceMonths)}
              id={`${line.id}-edit-recurrence`}
              inputRef={field.ref}
              label="Récurrence"
              name={field.name}
              onBlur={field.onBlur}
              onChange={field.onChange}
              required
              select
              value={field.value ?? ""}
            >
              <MenuItem disabled value="">
                Sélectionner une récurrence
              </MenuItem>
              {recurrenceOptions.map((months) => (
                <MenuItem key={months} value={String(months)}>
                  {formatRecurrence(months)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

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
          label="Utiliser une estimation"
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
              label="Valeur minimale"
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
              label="Valeur maximale"
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
            label="Montant"
            required
            slotProps={amountSlotProps}
          />
        )}
      </Stack>
    </FormDialog>
  );
}

function getLineFormDefaultValues(line: RecurringLine): LineFormInput {
  const baseValues = {
    categoryId: line.categoryId,
    description: line.description,
    recurrenceMonths: String(line.recurrenceMonths),
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
  values: z.output<typeof lineFormRawSchema>,
): CreateRecurringLineInput {
  if (!values.isEstimate) {
    return {
      amount: Math.abs(values.amount),
      categoryId: values.categoryId,
      description: values.description,
      isEstimate: false,
      movement: getMovementFromSignedAmount(values.amount),
      recurrenceMonths: values.recurrenceMonths,
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
    recurrenceMonths: values.recurrenceMonths,
    title: values.title,
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

const amountSlotProps = {
  htmlInput: {
    inputMode: "decimal",
  },
  input: {
    startAdornment: <InputAdornment position="start">€</InputAdornment>,
  },
} as const;
