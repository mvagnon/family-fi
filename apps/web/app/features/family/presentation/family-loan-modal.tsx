import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import type { Loan, UpdateLoanInput } from "../domain/family";
import { loanInputSchema } from "../domain/family";
import { useFamilyFormat } from "./use-family-format";

function createLoanFormSchema(messages: {
  initialAmountRequired: string;
  interestRateRequired: string;
  titleRequired: string;
}) {
  return z
    .object({
      annualInterestRate: requiredNumberTextSchema(
        messages.interestRateRequired,
      ).refine((value) => value >= 0, {
        message: messages.interestRateRequired,
      }),
      initialAmount: requiredNumberTextSchema(
        messages.initialAmountRequired,
      ).refine((value) => value > 0, {
        message: messages.initialAmountRequired,
      }),
      title: requiredTextSchema(messages.titleRequired),
    })
    .transform((values, context) => {
      const result = loanInputSchema.safeParse(values);

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

type LoanFormInput = z.input<ReturnType<typeof createLoanFormSchema>>;
type LoanFormValues = z.output<ReturnType<typeof createLoanFormSchema>>;

interface FamilyLoanModalProps {
  initialLoan?: Loan;
  isSaving?: boolean;
  mode?: "create" | "edit";
  onClose: () => void;
  onSave: (input: UpdateLoanInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyLoanModal({
  initialLoan,
  isSaving = false,
  mode = "create",
  onClose,
  onSave,
  open,
}: FamilyLoanModalProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const formSchema = useMemo(
    () =>
      createLoanFormSchema({
        initialAmountRequired: t("loans.loanModal.validation.initialAmount"),
        interestRateRequired: t("loans.loanModal.validation.interestRate"),
        titleRequired: t("loans.loanModal.validation.title"),
      }),
    [t],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoanFormInput, unknown, LoanFormValues>({
    defaultValues: {
      annualInterestRate: String(initialLoan?.annualInterestRate ?? 0),
      initialAmount: initialLoan ? String(initialLoan.initialAmount) : "",
      title: initialLoan?.title ?? "",
    },
    resolver: zodResolver(formSchema),
    shouldFocusError: true,
    shouldUnregister: true,
  });
  const { ref: titleRef, ...titleField } = register("title");
  const { ref: initialAmountRef, ...initialAmountField } =
    register("initialAmount");
  const { ref: annualInterestRateRef, ...annualInterestRateField } =
    register("annualInterestRate");

  function handleValidSubmit(values: LoanFormValues) {
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
          ? t("loans.loanModal.title")
          : t("loans.loanModal.editTitle")
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          {...titleField}
          autoFocus
          disabled={isSaving}
          error={Boolean(errors.title)}
          fullWidth
          helperText={getFieldErrorMessage(errors.title)}
          id="family-loan-title"
          inputRef={titleRef}
          label={t("loans.loanModal.fields.title")}
          required
        />
        <TextField
          {...initialAmountField}
          disabled={isSaving}
          error={Boolean(errors.initialAmount)}
          fullWidth
          helperText={getFieldErrorMessage(errors.initialAmount)}
          id="family-loan-initial-amount"
          inputRef={initialAmountRef}
          label={t("loans.loanModal.fields.initialAmount")}
          required
          slotProps={{
            htmlInput: {
              inputMode: "decimal",
            },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  {familyFormat.currencySymbol}
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          {...annualInterestRateField}
          disabled={isSaving}
          error={Boolean(errors.annualInterestRate)}
          fullWidth
          helperText={getFieldErrorMessage(errors.annualInterestRate)}
          id="family-loan-interest-rate"
          inputRef={annualInterestRateRef}
          label={t("loans.loanModal.fields.interestRate")}
          required
          slotProps={{
            htmlInput: {
              inputMode: "decimal",
              min: 0,
            },
            input: {
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            },
          }}
        />
      </Stack>
    </FormDialog>
  );
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

function getFieldErrorMessage(error: { message?: unknown } | undefined) {
  return typeof error?.message === "string" ? error.message : undefined;
}
