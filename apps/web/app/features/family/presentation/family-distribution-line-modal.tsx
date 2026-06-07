import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ActionIconButton } from "@repo/ui/action-icon-button";
import { FormDialog } from "@repo/ui/form-dialog";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import type {
  CreateDistributionLineInput,
  DistributionLine,
  FamilyMember,
} from "../domain/family";
import { distributionLineInputSchema } from "../domain/family";
import type { FamilyDistributionMemberBalance } from "../domain/family-distributions";
import {
  getAmountSlotProps,
  getFieldErrorMessage,
  requiredIntegerTextSchema,
  requiredNumberTextSchema,
  requiredTextSchema,
} from "./family-form-fields";
import { useFamilyFormat } from "./use-family-format";

interface DistributionLineFormValidationMessages {
  amountRequired: string;
  memberAmountInvalid: string;
  memberDuplicate: string;
  memberRequired: string;
  membersRequired: string;
  monthFuture: string;
  monthRequired: string;
  yearFuture: string;
  yearRequired: string;
}

function createDistributionLineFormSchema(
  messages: DistributionLineFormValidationMessages,
  currentMonthIndex: number,
  currentYear: number,
) {
  return z
    .object({
      amount: requiredNumberTextSchema(messages.amountRequired).refine(
        (value) => value > 0,
        { message: messages.amountRequired },
      ),
      memberAmounts: z
        .array(
          z.object({
            amount: requiredNumberTextSchema(
              messages.memberAmountInvalid,
            ).refine((value) => value >= 0, {
              message: messages.memberAmountInvalid,
            }),
            memberId: requiredTextSchema(messages.memberRequired),
          }),
        )
        .min(1, { message: messages.membersRequired }),
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
    .superRefine((values, context) => {
      if (values.year === currentYear && values.month > currentMonthIndex + 1) {
        context.addIssue({
          code: "custom",
          message: messages.monthFuture,
          path: ["month"],
        });
      }

      const memberIds = new Set<string>();
      values.memberAmounts.forEach((memberAmount, index) => {
        if (memberIds.has(memberAmount.memberId)) {
          context.addIssue({
            code: "custom",
            message: messages.memberDuplicate,
            path: ["memberAmounts", index, "memberId"],
          });
        }

        memberIds.add(memberAmount.memberId);
      });
    })
    .transform((values, context) => {
      const result = distributionLineInputSchema.safeParse(values);

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

type DistributionLineFormInput = z.input<
  ReturnType<typeof createDistributionLineFormSchema>
>;
type DistributionLineFormValues = z.output<
  ReturnType<typeof createDistributionLineFormSchema>
>;

interface FamilyDistributionLineModalProps {
  currentMonthIndex: number;
  currentYear: number;
  defaultYear: number;
  initialLine?: DistributionLine;
  isSaving?: boolean;
  memberBalances: FamilyDistributionMemberBalance[];
  members: FamilyMember[];
  mode?: "create" | "edit";
  onClose: () => void;
  onSave: (line: CreateDistributionLineInput) => Promise<void> | void;
  open: boolean;
}

export function FamilyDistributionLineModal({
  currentMonthIndex,
  currentYear,
  defaultYear,
  initialLine,
  isSaving = false,
  memberBalances,
  members,
  mode = "create",
  onClose,
  onSave,
  open,
}: FamilyDistributionLineModalProps) {
  const { i18n, t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const formSchema = useMemo(
    () =>
      createDistributionLineFormSchema(
        getDistributionLineFormValidationMessages(t),
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
  } = useForm<DistributionLineFormInput, unknown, DistributionLineFormValues>({
    defaultValues: {
      amount: initialLine ? String(initialLine.amount) : "",
      memberAmounts: getDefaultMemberAmounts(members, initialLine),
      month: String(initialLine?.month ?? currentMonthIndex + 1),
      year: String(initialLine?.year ?? defaultYear),
    },
    resolver: zodResolver(formSchema),
    shouldFocusError: true,
    shouldUnregister: true,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "memberAmounts",
  });
  const { ref: amountRef, ...amountField } = register("amount");
  const { ref: yearRef, ...yearField } = register("year");
  const baseAmount = parseAmountInput(watch("amount"));
  const selectedYear = Number(watch("year"));
  const selectedMemberAmounts = watch("memberAmounts") ?? [];
  const selectedMemberIds = selectedMemberAmounts.map(
    (memberAmount) => memberAmount.memberId,
  );
  const memberBalancesById = useMemo(
    () =>
      new Map(
        memberBalances.map((memberBalance) => [
          memberBalance.member.id,
          memberBalance.balance,
        ]),
      ),
    [memberBalances],
  );
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
  const nextAvailableMember = members.find((member) => {
    return !selectedMemberIds.includes(member.id);
  });

  function handleValidSubmit(values: DistributionLineFormValues) {
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
          ? t("distributions.creation.title")
          : t("distributions.creation.editTitle")
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Stack direction={{ sm: "row", xs: "column" }} spacing={2}>
          <TextField
            {...yearField}
            disabled={isSaving}
            error={Boolean(errors.year)}
            fullWidth
            helperText={getFieldErrorMessage(errors.year)}
            id="distribution-line-year"
            inputRef={yearRef}
            label={t("distributions.creation.year")}
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
                id="distribution-line-month"
                inputRef={field.ref}
                label={t("distributions.creation.month")}
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
          id="distribution-line-amount"
          inputRef={amountRef}
          label={t("distributions.creation.amount")}
          required
          slotProps={amountSlotProps}
        />

        <Stack spacing={1.25}>
          <Box>
            <Typography sx={{ fontWeight: 700 }} variant="subtitle2">
              {t("distributions.creation.memberAmounts")}
            </Typography>
            {getFieldErrorMessage(errors.memberAmounts) ? (
              <Typography color="error" variant="caption">
                {getFieldErrorMessage(errors.memberAmounts)}
              </Typography>
            ) : null}
          </Box>

          {fields.map((field, index) => {
            const selectedMemberAmount = selectedMemberAmounts[index];
            const selectedMemberId = selectedMemberAmount?.memberId ?? "";
            const balancePreview = selectedMemberId
              ? getMemberBalancePreview({
                  baseAmount,
                  currentBalance: memberBalancesById.get(selectedMemberId) ?? 0,
                  initialLine,
                  memberAmount: parseAmountInput(selectedMemberAmount?.amount),
                  memberId: selectedMemberId,
                })
              : null;

            return (
              <Box
                key={field.id}
                sx={{
                  alignItems: "start",
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: {
                    sm: "minmax(0, 1fr) minmax(150px, 190px) 40px",
                    xs: "minmax(0, 1fr)",
                  },
                }}
              >
                <Controller
                  control={control}
                  name={`memberAmounts.${index}.memberId`}
                  render={({ field: memberField }) => (
                    <TextField
                      disabled={isSaving}
                      error={Boolean(errors.memberAmounts?.[index]?.memberId)}
                      fullWidth
                      helperText={getFieldErrorMessage(
                        errors.memberAmounts?.[index]?.memberId,
                      )}
                      id={`distribution-line-member-${index}`}
                      inputRef={memberField.ref}
                      label={t("distributions.creation.memberField")}
                      name={memberField.name}
                      onBlur={memberField.onBlur}
                      onChange={memberField.onChange}
                      required
                      select
                      value={memberField.value ?? ""}
                    >
                      {members.map((member) => (
                        <MenuItem
                          disabled={
                            !member.isActive ||
                            (member.id !== memberField.value &&
                              selectedMemberIds.includes(member.id))
                          }
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
                  {...register(`memberAmounts.${index}.amount`)}
                  disabled={isSaving}
                  error={Boolean(errors.memberAmounts?.[index]?.amount)}
                  fullWidth
                  helperText={getFieldErrorMessage(
                    errors.memberAmounts?.[index]?.amount,
                  )}
                  id={`distribution-line-member-amount-${index}`}
                  label={t("distributions.creation.memberAmount")}
                  required
                  slotProps={amountSlotProps}
                />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <ActionIconButton
                    disabled={isSaving || fields.length <= 1}
                    icon={<DeleteIcon fontSize="small" />}
                    label={t("distributions.creation.removeMember")}
                    onClick={() => remove(index)}
                    size="small"
                    tooltip={t("distributions.creation.removeMember")}
                  />
                </Box>
                {balancePreview ? (
                  <Box sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
                    <DistributionMemberBalancePreview
                      currentBalance={balancePreview.currentBalance}
                      projectedBalance={balancePreview.projectedBalance}
                    />
                  </Box>
                ) : null}
              </Box>
            );
          })}

          <Button
            disabled={isSaving || !nextAvailableMember}
            onClick={() => {
              if (nextAvailableMember) {
                append({ amount: "", memberId: nextAvailableMember.id });
              }
            }}
            startIcon={<AddIcon />}
            sx={{ alignSelf: "flex-start" }}
            variant="text"
          >
            {t("distributions.creation.addMember")}
          </Button>
        </Stack>
      </Stack>
    </FormDialog>
  );
}

function DistributionMemberBalancePreview({
  currentBalance,
  projectedBalance,
}: {
  currentBalance: number;
  projectedBalance: number | null;
}) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();

  return (
    <Box
      sx={(theme) => ({
        bgcolor: theme.palette.action.hover,
        borderRadius: 1,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 1.5,
        justifyContent: "space-between",
        px: 1.25,
        py: 0.75,
        width: "100%",
      })}
    >
      <Typography
        color="text.secondary"
        sx={{ lineHeight: 1.35 }}
        variant="caption"
      >
        {t("distributions.creation.balanceCurrent", {
          amount: familyFormat.formatCurrency(currentBalance),
        })}
      </Typography>
      <Typography
        color={
          projectedBalance === null
            ? "text.secondary"
            : getBalanceColor(projectedBalance)
        }
        sx={{ lineHeight: 1.35 }}
        variant="caption"
      >
        {projectedBalance === null
          ? t("distributions.creation.balanceProjectedPending")
          : t("distributions.creation.balanceProjected", {
              amount: familyFormat.formatCurrency(projectedBalance),
            })}
      </Typography>
    </Box>
  );
}

function getMemberBalancePreview({
  baseAmount,
  currentBalance,
  initialLine,
  memberAmount,
  memberId,
}: {
  baseAmount: number | null;
  currentBalance: number;
  initialLine: DistributionLine | undefined;
  memberAmount: number | null;
  memberId: string;
}) {
  const previousLineDelta = initialLine
    ? getDistributionLineMemberBalanceDelta(initialLine, memberId)
    : 0;
  const projectedBalance =
    baseAmount === null || memberAmount === null
      ? null
      : roundCurrency(
          currentBalance - previousLineDelta + baseAmount - memberAmount,
        );

  return {
    currentBalance: roundCurrency(currentBalance),
    projectedBalance,
  };
}

function getDistributionLineMemberBalanceDelta(
  line: DistributionLine,
  memberId: string,
): number {
  const memberAmount = line.memberAmounts.find((item) => {
    return item.memberId === memberId;
  });

  return memberAmount ? roundCurrency(line.amount - memberAmount.amount) : 0;
}

function parseAmountInput(value: unknown): number | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const normalizedValue = String(value).trim().replace(",", ".");

  if (!normalizedValue) {
    return null;
  }

  const amount = Number(normalizedValue);

  return Number.isFinite(amount) ? amount : null;
}

function getBalanceColor(balance: number) {
  if (balance > 0) {
    return "success.main";
  }

  if (balance < 0) {
    return "error.main";
  }

  return "text.secondary";
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function getDistributionLineFormValidationMessages(
  t: TFunction,
): DistributionLineFormValidationMessages {
  return {
    amountRequired: t("distributions.creation.validation.amountRequired"),
    memberAmountInvalid: t(
      "distributions.creation.validation.memberAmountInvalid",
    ),
    memberDuplicate: t("distributions.creation.validation.memberDuplicate"),
    memberRequired: t("distributions.creation.validation.memberRequired"),
    membersRequired: t("distributions.creation.validation.membersRequired"),
    monthFuture: t("distributions.creation.validation.monthFuture"),
    monthRequired: t("distributions.creation.validation.monthRequired"),
    yearFuture: t("distributions.creation.validation.yearFuture"),
    yearRequired: t("distributions.creation.validation.yearRequired"),
  };
}

function getDefaultMemberAmounts(
  members: FamilyMember[],
  initialLine: DistributionLine | undefined,
): DistributionLineFormInput["memberAmounts"] {
  if (initialLine) {
    return initialLine.memberAmounts.map((memberAmount) => ({
      amount: String(memberAmount.amount),
      memberId: memberAmount.memberId,
    }));
  }

  return members.map((member) => ({
    amount: "",
    memberId: member.id,
  }));
}
