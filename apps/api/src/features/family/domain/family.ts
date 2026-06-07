export const DUPLICATE_FAMILY_CATEGORY_LABEL_MESSAGE =
  "Une catégorie avec ce nom existe déjà.";
export const DUPLICATE_FAMILY_MEMBER_NAME_MESSAGE =
  "Un membre avec ce nom existe déjà.";
export const LINKED_FAMILY_CATEGORY_DELETE_MESSAGE =
  "La catégorie liée à un membre doit être supprimée avec ce membre.";

export {
  createFamilyCategoryInputSchema,
  createFamilyMemberInputSchema,
  familyCategoryKindSchema,
  familyCategorySchema,
  familyMemberSchema,
  familySchema,
  loanInputSchema,
  loanRepaymentLineInputSchema,
  loanRepaymentLineSchema,
  loanSchema,
  loanVisibilityInputSchema,
  participationLineInputSchema,
  participationLineSchema,
  recurringLineInputSchema,
  recurringLineSchema,
  updateLoanInputSchema,
  updateFamilyMemberInputSchema,
} from "@repo/api-contracts/family";

export type {
  CreateLoanInput,
  CreateLoanRepaymentLineInput,
  CreateParticipationLineInput,
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family as FamilySnapshot,
  FamilyCategory,
  FamilyMember,
  Loan,
  LoanRepaymentLine,
  Movement,
  ParticipationLine,
  RecurringLine,
  UpdateLoanInput,
  UpdateLoanRepaymentLineInput,
  UpdateLoanVisibilityInput,
  UpdateParticipationLineInput,
  UpdateFamilyMemberInput,
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

export class ParticipationLineNotFoundError extends FamilyEntityNotFoundError {
  constructor(lineId: string) {
    super(`Participation line ${lineId} was not found.`);
    this.name = "ParticipationLineNotFoundError";
  }
}

export class LoanNotFoundError extends FamilyEntityNotFoundError {
  constructor(loanId: string) {
    super(`Loan ${loanId} was not found.`);
    this.name = "LoanNotFoundError";
  }
}

export class LoanRepaymentLineNotFoundError extends FamilyEntityNotFoundError {
  constructor(lineId: string) {
    super(`Loan repayment line ${lineId} was not found.`);
    this.name = "LoanRepaymentLineNotFoundError";
  }
}
