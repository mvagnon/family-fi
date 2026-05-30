export const DEV_USER_ID = "dev-user";
export const DUPLICATE_FAMILY_CATEGORY_LABEL_MESSAGE =
  "Une catégorie avec ce nom existe déjà.";
export const DUPLICATE_FAMILY_MEMBER_NAME_MESSAGE =
  "Un membre avec ce nom existe déjà.";
export const FAMILY_CATEGORY_IN_USE_MESSAGE =
  "La catégorie ne peut pas être supprimée car elle est utilisée par une ligne récurrente.";
export const FAMILY_MEMBER_CATEGORY_IN_USE_MESSAGE =
  "Le membre ne peut pas être supprimé car une catégorie liée est utilisée par une ligne récurrente.";
export const LINKED_FAMILY_CATEGORY_DELETE_MESSAGE =
  "La catégorie liée à un membre doit être supprimée avec ce membre.";

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

export class FamilyEntityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyEntityNotFoundError";
  }
}

export class FamilyMemberNotFoundError extends FamilyEntityNotFoundError {
  constructor(memberId: string) {
    super(`Family member ${memberId} was not found.`);
    this.name = "FamilyMemberNotFoundError";
  }
}

export class FamilyCategoryNotFoundError extends FamilyEntityNotFoundError {
  constructor(categoryId: string) {
    super(`Family category ${categoryId} was not found.`);
    this.name = "FamilyCategoryNotFoundError";
  }
}

export class RecurringLineNotFoundError extends FamilyEntityNotFoundError {
  constructor(lineId: string) {
    super(`Recurring line ${lineId} was not found.`);
    this.name = "RecurringLineNotFoundError";
  }
}
