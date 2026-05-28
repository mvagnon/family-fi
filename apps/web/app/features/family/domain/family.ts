export type Movement = "positive" | "negative";

export interface FamilyMember {
  id: string;
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

export interface Family {
  id: string;
  userIds: string[];
  members: FamilyMember[];
  categories: FamilyCategory[];
  recurringLines: RecurringLine[];
}

export interface CreateFamilyMemberInput {
  categoryLabel?: string;
  name: string;
  role: string;
}

export interface CreateFamilyCategoryInput {
  label: string;
}

export type CreateRecurringLineInput = Omit<RecurringLine, "id">;

export type UpdateRecurringLineInput = Omit<RecurringLine, "id">;
