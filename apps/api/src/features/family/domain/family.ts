export const DEV_USER_ID = "dev-user";

export type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family as FamilySnapshot,
  FamilyCategory,
  FamilyMember,
  Movement,
  RecurringLine,
  UpdateRecurringLineInput,
} from "@repo/api-contracts/family";

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
