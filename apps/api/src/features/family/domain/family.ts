export const DEV_USER_ID = "dev-user";
export const DUPLICATE_FAMILY_CATEGORY_LABEL_MESSAGE =
  "Une catégorie avec ce nom existe déjà.";
export const DUPLICATE_FAMILY_MEMBER_NAME_MESSAGE =
  "Un membre avec ce nom existe déjà.";

export { recurringLineInputSchema } from "@repo/api-contracts/family";

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
