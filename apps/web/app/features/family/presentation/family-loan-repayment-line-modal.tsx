import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { FormDialog } from "@repo/ui/form-dialog";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import type {
  CreateLoanRepaymentLineInput,
  Family,
  Loan,
  LoanRepaymentLine,
} from "../domain/family";
import { loanRepaymentLineInputSchema } from "../domain/family";
import { getSuggestedLoanFees } from "../domain/family-loans";
import {
  getAmountSlotProps,
  getFieldErrorMessage,
  requiredIntegerTextSchema,
  requiredNumberTextSchema,
  requiredTextSchema,
} from "./family-form-fields";
import { useFamilyFormat } from "./use-family-format";

interface LoanRepaymentLineFormValidationMessages {
  feesInvalid: string;
  feesTooHigh: string;
  loanRequired: string;
  monthFuture: string;
  monthRequired: string;
  paidAmountRequired: string;
  yearFuture: string;
  yearRequired: string;
}

function createLoanRepaymentLineFormSchema(
  messages: LoanRepaymentLineFormValidationMessages,
  currentMonthIndex: number,
  currentYear: number,
) {
  return z
    .object({
      feesAmount: requiredNumberTextSchema(messages.feesInvalid).refine(
        (value) => value >= 0,
        { message: messages.feesInvalid },
      ),
      loanId: requiredTextSchema(messages.loanRequired),
      month: requiredIntegerTextSchema(messages.monthRequired).refine(
        (value) => value >= 1 && value <= 12,
        { message: messages.monthRequired },
      ),
      paidAmount: requiredNumberTextSchema(messages.paidAmountRequired).refine(
        (value) => value > 0,
        {
          message: messages.paidAmountRequired,
        },
      ),
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

      if (values.feesAmount > values.paidAmount) {
        context.addIssue({
          code: "custom",
          message: messages.feesTooHigh,
          path: ["feesAmount"],
        });
      }
    })
    .transform((values, context) => {
      const result = loanRepaymentLineInputSchema.safeParse(values);

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

type LoanRepaymentLineFormInput = z.input<
  ReturnType<typeof createLoanRepaymentLineFormSchema>
>;
type LoanRepaymentLineFormValues = z.output<
  ReturnType<typeof createLoanRepaymentLineFormSchema>
>;

interface FamilyLoanRepaymentLineModalProps {
  currentMonthIndex: number;
  currentYear: number;
  defaultLoanId: string;
  defaultYear: number;
  family: Family;
  initialLine?: LoanRepaymentLine;
  isSaving?: boolean;
  loans: Loan[];
  mode?: "create" | "edit";
  onClose: () => void;
  onSave: (line: CreateLoanRepaymentLineInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyLoanRepaymentLineModal({
  currentMonthIndex,
  currentYear,
  defaultLoanId,
  defaultYear,
  family,
  initialLine,
  isSaving = false,
  loans,
  mode = "create",
  onClose,
  onSave,
  open,
}: FamilyLoanRepaymentLineModalProps) {
  const { i18n, t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const [feesTouched, setFeesTouched] = useState(Boolean(initialLine));
  const autoFilledFeesRef = useRef("");
  const formSchema = useMemo(
    () =>
      createLoanRepaymentLineFormSchema(
        getLoanRepaymentLineFormValidationMessages(t),
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
    setValue,
    watch,
  } = useForm<LoanRepaymentLineFormInput, unknown, LoanRepaymentLineFormValues>(
    {
      defaultValues: {
        feesAmount: initialLine ? String(initialLine.feesAmount) : "",
        loanId: initialLine?.loanId ?? defaultLoanId,
        month: String(initialLine?.month ?? currentMonthIndex + 1),
        paidAmount: initialLine ? String(initialLine.paidAmount) : "",
        year: String(initialLine?.year ?? defaultYear),
      },
      resolver: zodResolver(formSchema),
      shouldFocusError: true,
      shouldUnregister: true,
    },
  );
  const { ref: paidAmountRef, ...paidAmountField } = register("paidAmount");
  const {
    ref: feesAmountRef,
    onChange: onFeesAmountChange,
    ...feesAmountField
  } = register("feesAmount");
  const { ref: yearRef, ...yearField } = register("year");
  const selectedLoanId = watch("loanId");
  const selectedYear = Number(watch("year"));
  const selectedMonth = Number(watch("month"));
  const paidAmount = Number(String(watch("paidAmount")).replace(",", "."));
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

  useEffect(() => {
    if (
      feesTouched ||
      !selectedLoanId ||
      !Number.isFinite(selectedYear) ||
      !Number.isFinite(selectedMonth) ||
      !Number.isFinite(paidAmount) ||
      paidAmount <= 0
    ) {
      return;
    }

    const suggestedFees = getSuggestedLoanFees(family, {
      ignoredLineId: initialLine?.id,
      loanId: selectedLoanId,
      month: selectedMonth,
      year: selectedYear,
    });
    const nextFees = String(suggestedFees);

    autoFilledFeesRef.current = nextFees;
    setValue("feesAmount", nextFees, {
      shouldDirty: false,
      shouldValidate: true,
    });
  }, [
    family,
    feesTouched,
    initialLine?.id,
    paidAmount,
    selectedLoanId,
    selectedMonth,
    selectedYear,
    setValue,
  ]);

  function handleValidSubmit(values: LoanRepaymentLineFormValues) {
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
          ? t("loans.repaymentModal.title")
          : t("loans.repaymentModal.editTitle")
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Controller
          control={control}
          name="loanId"
          render={({ field }) => (
            <TextField
              disabled={isSaving}
              error={Boolean(errors.loanId)}
              fullWidth
              helperText={getFieldErrorMessage(errors.loanId)}
              id="loan-repayment-line-loan"
              inputRef={field.ref}
              label={t("loans.repaymentModal.fields.loan")}
              name={field.name}
              onBlur={field.onBlur}
              onChange={(event) => {
                setFeesTouched(false);
                field.onChange(event);
              }}
              required
              select
              value={field.value ?? ""}
            >
              {loans.map((loan) => (
                <MenuItem key={loan.id} value={loan.id}>
                  {loan.title}
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
            id="loan-repayment-line-year"
            inputRef={yearRef}
            label={t("loans.repaymentModal.fields.year")}
            onChange={(event) => {
              setFeesTouched(false);
              yearField.onChange(event);
            }}
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
                id="loan-repayment-line-month"
                inputRef={field.ref}
                label={t("loans.repaymentModal.fields.month")}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(event) => {
                  setFeesTouched(false);
                  field.onChange(event);
                }}
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
          {...paidAmountField}
          autoFocus
          disabled={isSaving}
          error={Boolean(errors.paidAmount)}
          fullWidth
          helperText={getFieldErrorMessage(errors.paidAmount)}
          id="loan-repayment-line-paid-amount"
          inputRef={paidAmountRef}
          label={t("loans.repaymentModal.fields.paidAmount")}
          onChange={(event) => {
            setFeesTouched(false);
            paidAmountField.onChange(event);
          }}
          required
          slotProps={getAmountSlotProps(familyFormat.currencySymbol)}
        />
        <TextField
          {...feesAmountField}
          disabled={isSaving}
          error={Boolean(errors.feesAmount)}
          fullWidth
          helperText={getFieldErrorMessage(errors.feesAmount)}
          id="loan-repayment-line-fees-amount"
          inputRef={feesAmountRef}
          label={t("loans.repaymentModal.fields.feesAmount")}
          onChange={(event) => {
            setFeesTouched(event.target.value !== autoFilledFeesRef.current);
            onFeesAmountChange(event);
          }}
          required
          slotProps={getAmountSlotProps(familyFormat.currencySymbol)}
        />
      </Stack>
    </FormDialog>
  );
}

function getLoanRepaymentLineFormValidationMessages(
  t: TFunction,
): LoanRepaymentLineFormValidationMessages {
  return {
    feesInvalid: t("loans.repaymentModal.validation.feesInvalid"),
    feesTooHigh: t("loans.repaymentModal.validation.feesTooHigh"),
    loanRequired: t("loans.repaymentModal.validation.loanRequired"),
    monthFuture: t("loans.repaymentModal.validation.monthFuture"),
    monthRequired: t("loans.repaymentModal.validation.monthRequired"),
    paidAmountRequired: t("loans.repaymentModal.validation.paidAmount"),
    yearFuture: t("loans.repaymentModal.validation.yearFuture"),
    yearRequired: t("loans.repaymentModal.validation.yearRequired"),
  };
}
