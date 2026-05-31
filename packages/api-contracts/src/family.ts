import { z } from "zod";

export const movementSchema = z.enum(["positive", "negative"]);

export type Movement = z.infer<typeof movementSchema>;

export interface FamilyMember {
  id: string;
  isActive: boolean;
  name: string;
  role: string;
}

export interface FamilyCategory {
  id: string;
  label: string;
  kind: "shared" | "professional";
  ownerId?: string;
}

export interface RecurringLine {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  movement: Movement;
  amount: number;
  isEstimate: boolean;
  recurrenceMonths: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface ParticipationLine {
  id: string;
  createdAt: string;
  memberId: string;
  amount: number;
  year: number;
  month: number;
}

export interface Family {
  id: string;
  members: FamilyMember[];
  categories: FamilyCategory[];
  recurringLines: RecurringLine[];
  participationLines: ParticipationLine[];
}

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

export type UpdateRecurringLineInput = Omit<RecurringLine, "id">;

export type CreateParticipationLineInput = Omit<
  ParticipationLine,
  "createdAt" | "id"
>;

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
);

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
