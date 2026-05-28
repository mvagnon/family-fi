export type Movement = "positive" | "negative";

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  professionalCategory: string;
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
