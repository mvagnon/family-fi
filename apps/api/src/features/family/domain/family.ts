export const DEV_USER_ID = "dev-user";

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

export interface FamilySnapshot {
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
  kind?: FamilyCategory["kind"];
  label: string;
  ownerId?: string;
}

export type CreateRecurringLineInput = Omit<RecurringLine, "id">;

export type UpdateRecurringLineInput = Omit<RecurringLine, "id">;

export class InvalidFamilyInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFamilyInputError";
  }
}

export class RecurringLineNotFoundError extends Error {
  constructor(lineId: string) {
    super(`Recurring line ${lineId} was not found.`);
    this.name = "RecurringLineNotFoundError";
  }
}
