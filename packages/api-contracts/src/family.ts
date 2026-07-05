import { z } from "zod";

export const movementSchema = z.enum(["positive", "negative"]);

export const familyCategoryKindSchema = z.enum(["shared", "professional"]);

export const generatedRecurringLineSourceSchema = z.enum([
  "loans",
  "participations",
  "distribution",
]);

export const familyMemberSchema = z
  .object({
    id: z.string(),
    isActive: z.boolean(),
    name: z.string(),
  })
  .meta({ id: "FamilyMember" });

export const familyCategorySchema = z
  .object({
    id: z.string(),
    kind: familyCategoryKindSchema,
    label: z.string(),
    ownerId: z.string().optional(),
  })
  .meta({ id: "FamilyCategory" });

export const recurringLineSchema = z
  .object({
    amount: z.number(),
    categoryId: z.string(),
    description: z.string(),
    id: z.string(),
    isEstimate: z.boolean(),
    maxAmount: z.number().optional(),
    minAmount: z.number().optional(),
    movement: movementSchema,
    recurrenceMonths: z.number().positive(),
    title: z.string(),
  })
  .meta({ id: "RecurringLine" });

export const participationLineSchema = z
  .object({
    amount: z.number().refine((value) => value !== 0),
    createdAt: z.string(),
    id: z.string(),
    isExcludedFromStats: z.boolean(),
    memberId: z.string(),
    month: z.number().int().min(1).max(12),
    title: z.string().optional(),
    year: z.number().int().positive(),
  })
  .meta({ id: "ParticipationLine" });

export const distributionMemberAmountSchema = z
  .object({
    amount: z.number(),
    memberId: z.string(),
  })
  .meta({ id: "DistributionMemberAmount" });

export const distributionLineSchema = z
  .object({
    amount: z.number().nonnegative(),
    createdAt: z.string(),
    id: z.string(),
    isExcludedFromStats: z.boolean(),
    memberAmounts: z.array(distributionMemberAmountSchema),
    month: z.number().int().min(1).max(12),
    year: z.number().int().positive(),
  })
  .meta({ id: "DistributionLine" });

export const loanSchema = z
  .object({
    annualInterestRate: z.number().nonnegative(),
    createdAt: z.string(),
    id: z.string(),
    initialAmount: z.number().positive(),
    title: z.string(),
  })
  .meta({ id: "Loan" });

export const loanRepaymentLineSchema = z
  .object({
    createdAt: z.string(),
    feesAmount: z.number().nonnegative(),
    id: z.string(),
    isExcludedFromStats: z.boolean(),
    loanId: z.string(),
    month: z.number().int().min(1).max(12),
    paidAmount: z.number().positive(),
    year: z.number().int().positive(),
  })
  .meta({ id: "LoanRepaymentLine" });

export const generatedRecurringLineKeySchema = z
  .object({
    source: generatedRecurringLineSourceSchema,
    sourceId: requiredTextSchema(
      "Generated recurring line source id is required.",
    ),
  })
  .meta({ id: "GeneratedRecurringLineKey" });

export const generatedRecurringLineSettingSchema =
  generatedRecurringLineKeySchema
    .extend({
      isEnabled: z.boolean({
        error: "Generated recurring line enabled state is invalid.",
      }),
    })
    .meta({ id: "GeneratedRecurringLineSetting" });

export const familySchema = z
  .object({
    categories: z.array(familyCategorySchema),
    distributionLines: z.array(distributionLineSchema),
    generatedRecurringLineSettings: z.array(
      generatedRecurringLineSettingSchema,
    ),
    id: z.string(),
    loanRepaymentLines: z.array(loanRepaymentLineSchema),
    loans: z.array(loanSchema),
    members: z.array(familyMemberSchema),
    participationLines: z.array(participationLineSchema),
    recurringLines: z.array(recurringLineSchema),
  })
  .meta({ id: "Family" });

export type Movement = z.infer<typeof movementSchema>;
export type FamilyMember = z.infer<typeof familyMemberSchema>;
export type FamilyCategory = z.infer<typeof familyCategorySchema>;
export type RecurringLine = z.infer<typeof recurringLineSchema>;
export type ParticipationLine = z.infer<typeof participationLineSchema>;
export type DistributionMemberAmount = z.infer<
  typeof distributionMemberAmountSchema
>;
export type DistributionLine = z.infer<typeof distributionLineSchema>;
export type Loan = z.infer<typeof loanSchema>;
export type LoanRepaymentLine = z.infer<typeof loanRepaymentLineSchema>;
export type GeneratedRecurringLineSource = z.infer<
  typeof generatedRecurringLineSourceSchema
>;
export type GeneratedRecurringLineKey = z.infer<
  typeof generatedRecurringLineKeySchema
>;
export type GeneratedRecurringLineSetting = z.infer<
  typeof generatedRecurringLineSettingSchema
>;
export type Family = z.infer<typeof familySchema>;

export interface CreateFamilyMemberInput {
  isActive: boolean;
  name: string;
}

export type UpdateFamilyMemberInput = CreateFamilyMemberInput;

export interface CreateFamilyCategoryInput {
  kind?: FamilyCategory["kind"];
  label: string;
  ownerId?: string;
}

export type CreateRecurringLineInput = Omit<RecurringLine, "id">;

export type UpdateRecurringLineInput = CreateRecurringLineInput;

export type CreateParticipationLineInput = Omit<
  ParticipationLine,
  "createdAt" | "id"
>;

export type UpdateParticipationLineInput = CreateParticipationLineInput;

export type CreateDistributionLineInput = Omit<
  DistributionLine,
  "createdAt" | "id"
>;

export type UpdateDistributionLineInput = CreateDistributionLineInput;

export interface CreateLoanInput {
  annualInterestRate: number;
  initialAmount: number;
  title: string;
}

export interface UpdateLoanInput {
  annualInterestRate: number;
  initialAmount: number;
  title: string;
}

export type CreateLoanRepaymentLineInput = Omit<
  LoanRepaymentLine,
  "createdAt" | "id"
>;

export type UpdateLoanRepaymentLineInput = CreateLoanRepaymentLineInput;

export type UpdateGeneratedRecurringLineSettingInput =
  GeneratedRecurringLineSetting;

const familyMemberNameInputSchema = z.string({
  error: "name must be a string.",
});

const familyMemberIsActiveInputSchema = z.boolean({
  error: "isActive must be a boolean.",
});

export const createFamilyMemberInputSchema = z
  .object({
    isActive: familyMemberIsActiveInputSchema.optional().default(true),
    name: familyMemberNameInputSchema,
  })
  .meta({ id: "CreateFamilyMemberInput" });

export const updateFamilyMemberInputSchema = z
  .object({
    isActive: familyMemberIsActiveInputSchema,
    name: familyMemberNameInputSchema,
  })
  .meta({ id: "UpdateFamilyMemberInput" });

export const createFamilyCategoryInputSchema = z
  .object({
    kind: z
      .union([familyCategoryKindSchema, z.literal("")], {
        error: "Category kind is invalid.",
      })
      .nullish()
      .transform((value) => {
        return value ? value : undefined;
      }),
    label: z.string({ error: "label must be a string." }),
    ownerId: z
      .string({ error: "ownerId must be a string." })
      .nullish()
      .transform((value) => value ?? undefined),
  })
  .meta({ id: "CreateFamilyCategoryInput" });

const recurringLineBaseInputSchema = z.object({
  categoryId: requiredTextSchema("Recurring line category is required."),
  description: z
    .string()
    .nullish()
    .transform((value) => value?.trim() ?? ""),
  movement: movementSchema,
  recurrenceMonths: positiveNumberSchema(
    "Recurring line recurrence must be positive.",
  ),
  title: requiredTextSchema("Recurring line title is required."),
});

const recurringLineRawInputSchema = z.discriminatedUnion("isEstimate", [
  recurringLineBaseInputSchema.extend({
    amount: positiveNumberSchema("Recurring line amount must be positive."),
    isEstimate: z.literal(false),
    maxAmount: optionalPositiveNumberSchema("Maximum amount is invalid."),
    minAmount: optionalPositiveNumberSchema("Minimum amount is invalid."),
  }),
  recurringLineBaseInputSchema.extend({
    amount: optionalPositiveNumberSchema(
      "Recurring line amount must be positive.",
    ),
    isEstimate: z.literal(true),
    maxAmount: positiveNumberSchema("Maximum amount is required."),
    minAmount: positiveNumberSchema("Minimum amount is required."),
  }),
]);

export const recurringLineInputSchema = recurringLineRawInputSchema.transform(
  (line): CreateRecurringLineInput => {
    if (!line.isEstimate) {
      return {
        amount: line.amount,
        categoryId: line.categoryId,
        description: line.description,
        isEstimate: false,
        movement: line.movement,
        recurrenceMonths: line.recurrenceMonths,
        title: line.title,
      };
    }

    const minAmount = Math.min(line.minAmount, line.maxAmount);
    const maxAmount = Math.max(line.minAmount, line.maxAmount);

    return {
      amount: (minAmount + maxAmount) / 2,
      categoryId: line.categoryId,
      description: line.description,
      isEstimate: true,
      maxAmount,
      minAmount,
      movement: line.movement,
      recurrenceMonths: line.recurrenceMonths,
      title: line.title,
    };
  },
) as z.ZodType<CreateRecurringLineInput, CreateRecurringLineInput>;

export const participationLineInputSchema = z.object({
  amount: nonZeroNumberSchema(
    "Participation amount must be different from zero.",
  ),
  isExcludedFromStats: excludedFromStatsInputSchema(
    "Participation statistics exclusion is invalid.",
  ),
  memberId: requiredTextSchema("Participation member is required."),
  month: z
    .number({ error: "Participation month is invalid." })
    .int({ message: "Participation month is invalid." })
    .min(1, { message: "Participation month is invalid." })
    .max(12, { message: "Participation month is invalid." }),
  title: z
    .string({ error: "Participation title is invalid." })
    .nullish()
    .transform((value) => value?.trim() || undefined),
  year: z
    .number({ error: "Participation year is invalid." })
    .int({ message: "Participation year is invalid." })
    .positive({ message: "Participation year is invalid." }),
});

export const distributionMemberAmountInputSchema = z
  .object({
    amount: z.number({ error: "Distribution member amount is invalid." }),
    memberId: requiredTextSchema("Distribution member is required."),
  })
  .meta({ id: "DistributionMemberAmountInput" });

export const distributionLineInputSchema = z
  .object({
    amount: nonNegativeNumberSchema("Distribution amount is invalid."),
    isExcludedFromStats: excludedFromStatsInputSchema(
      "Distribution statistics exclusion is invalid.",
    ),
    memberAmounts: z
      .array(distributionMemberAmountInputSchema)
      .min(1, { message: "Distribution members are required." }),
    month: z
      .number({ error: "Distribution month is invalid." })
      .int({ message: "Distribution month is invalid." })
      .min(1, { message: "Distribution month is invalid." })
      .max(12, { message: "Distribution month is invalid." }),
    year: z
      .number({ error: "Distribution year is invalid." })
      .int({ message: "Distribution year is invalid." })
      .positive({ message: "Distribution year is invalid." }),
  })
  .superRefine((line, context) => {
    const memberIds = new Set<string>();

    line.memberAmounts.forEach((memberAmount, index) => {
      if (memberIds.has(memberAmount.memberId)) {
        context.addIssue({
          code: "custom",
          message: "Distribution member is duplicated.",
          path: ["memberAmounts", index, "memberId"],
        });
      }

      memberIds.add(memberAmount.memberId);
    });
  })
  .meta({ id: "DistributionLineInput" });

export const loanInputSchema = z
  .object({
    annualInterestRate: nonNegativeNumberSchema(
      "Loan interest rate is invalid.",
    ),
    initialAmount: positiveNumberSchema("Loan initial amount is required."),
    title: requiredTextSchema("Loan title is required."),
  })
  .meta({ id: "LoanInput" });

export const updateLoanInputSchema = loanInputSchema.meta({
  id: "UpdateLoanInput",
});

export const loanRepaymentLineInputSchema = z
  .object({
    feesAmount: nonNegativeNumberSchema("Loan fees amount is invalid."),
    isExcludedFromStats: excludedFromStatsInputSchema(
      "Loan repayment statistics exclusion is invalid.",
    ),
    loanId: requiredTextSchema("Loan is required."),
    month: z
      .number({ error: "Loan repayment month is invalid." })
      .int({ message: "Loan repayment month is invalid." })
      .min(1, { message: "Loan repayment month is invalid." })
      .max(12, { message: "Loan repayment month is invalid." }),
    paidAmount: positiveNumberSchema("Loan paid amount is required."),
    year: z
      .number({ error: "Loan repayment year is invalid." })
      .int({ message: "Loan repayment year is invalid." })
      .positive({ message: "Loan repayment year is invalid." }),
  })
  .refine((line) => line.feesAmount <= line.paidAmount, {
    message: "Loan fees cannot exceed the paid amount.",
    path: ["feesAmount"],
  })
  .meta({ id: "LoanRepaymentLineInput" });

export const updateGeneratedRecurringLineSettingInputSchema =
  generatedRecurringLineSettingSchema.meta({
    id: "UpdateGeneratedRecurringLineSettingInput",
  });

function requiredTextSchema(message: string) {
  return z.string({ error: message }).trim().min(1, { message });
}

function positiveNumberSchema(message: string) {
  return z.number({ error: message }).positive({ message });
}

function nonZeroNumberSchema(message: string) {
  return z
    .number({ error: message })
    .refine((value) => value !== 0, { message });
}

function nonNegativeNumberSchema(message: string) {
  return z.number({ error: message }).nonnegative({ message });
}

function excludedFromStatsInputSchema(message: string) {
  return z.boolean({ error: message }).optional().default(false);
}

function optionalPositiveNumberSchema(message: string) {
  return positiveNumberSchema(message)
    .nullish()
    .transform((value) => value ?? undefined);
}
