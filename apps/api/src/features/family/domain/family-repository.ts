import type {
  FamilySnapshot,
  Loan,
  LoanRepaymentLine,
  ParticipationLine,
  RecurringLine,
} from "./family.js";

export interface FamilyRepository {
  createFamily(
    spaceId: string,
    family: FamilySnapshot,
  ): Promise<FamilySnapshot>;
  createRecurringLine(
    familyId: string,
    line: RecurringLine,
  ): Promise<FamilySnapshot>;
  createParticipationLine(
    familyId: string,
    line: ParticipationLine,
  ): Promise<FamilySnapshot>;
  createLoan(familyId: string, loan: Loan): Promise<FamilySnapshot>;
  createLoanRepaymentLine(
    familyId: string,
    line: LoanRepaymentLine,
  ): Promise<FamilySnapshot>;
  deleteLoan(familyId: string, loanId: string): Promise<FamilySnapshot | null>;
  deleteLoanRepaymentLine(
    familyId: string,
    lineId: string,
  ): Promise<FamilySnapshot | null>;
  deleteParticipationLine(
    familyId: string,
    lineId: string,
  ): Promise<FamilySnapshot | null>;
  deleteCategory(
    familyId: string,
    categoryId: string,
  ): Promise<FamilySnapshot | null>;
  deleteMember(
    familyId: string,
    memberId: string,
  ): Promise<FamilySnapshot | null>;
  deleteRecurringLine(
    familyId: string,
    lineId: string,
  ): Promise<FamilySnapshot | null>;
  findBySpaceId(spaceId: string): Promise<FamilySnapshot | null>;
  saveFamily(family: FamilySnapshot): Promise<FamilySnapshot>;
  updateRecurringLine(
    familyId: string,
    line: RecurringLine,
  ): Promise<FamilySnapshot | null>;
  updateParticipationLine(
    familyId: string,
    line: ParticipationLine,
  ): Promise<FamilySnapshot | null>;
  updateLoan(familyId: string, loan: Loan): Promise<FamilySnapshot | null>;
  updateLoanRepaymentLine(
    familyId: string,
    line: LoanRepaymentLine,
  ): Promise<FamilySnapshot | null>;
  updateLoanVisibility(
    familyId: string,
    loanId: string,
    isHidden: boolean,
  ): Promise<FamilySnapshot | null>;
}
