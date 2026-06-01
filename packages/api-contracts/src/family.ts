import { z } from "zod";

export const movementSchema = z.enum(["positive", "negative"]);

export const familyCategoryKindSchema = z.enum(["shared", "professional"]);

export const familyMemberSchema = z
  .object({
    id: z.string(),
    isActive: z.boolean(),
    name: z.string(),
    role: z.string(),
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
    memberId: z.string(),
    month: z.number().int().min(1).max(12),
    year: z.number().int().positive(),
  })
  .meta({ id: "ParticipationLine" });

export const familySchema = z
  .object({
    categories: z.array(familyCategorySchema),
    id: z.string(),
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
export type Family = z.infer<typeof familySchema>;

export interface CreateFamilyMemberInput {
  isActive: boolean;
  name: string;
}

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

export const createFamilyMemberInputSchema = z
  .object({
    isActive: z
      .boolean({ error: "isActive must be a boolean." })
      .optional()
      .default(true),
    name: z.string({ error: "name must be a string." }),
  })
  .meta({ id: "CreateFamilyMemberInput" });

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
  memberId: requiredTextSchema("Participation member is required."),
  month: z
    .number({ error: "Participation month is invalid." })
    .int({ message: "Participation month is invalid." })
    .min(1, { message: "Participation month is invalid." })
    .max(12, { message: "Participation month is invalid." }),
  year: z
    .number({ error: "Participation year is invalid." })
    .int({ message: "Participation year is invalid." })
    .positive({ message: "Participation year is invalid." }),
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

function optionalPositiveNumberSchema(message: string) {
  return positiveNumberSchema(message)
    .nullish()
    .transform((value) => value ?? undefined);
}
