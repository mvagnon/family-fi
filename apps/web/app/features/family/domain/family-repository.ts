import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateLoanInput,
  CreateLoanRepaymentLineInput,
  CreateParticipationLineInput,
  CreateRecurringLineInput,
  Family,
  UpdateLoanInput,
  UpdateLoanRepaymentLineInput,
  UpdateFamilyMemberInput,
  UpdateParticipationLineInput,
  UpdateRecurringLineInput,
} from "./family";

export interface FamilyRepository {
  addCategory(
    spaceId: string,
    input: CreateFamilyCategoryInput,
  ): Promise<Family>;
  addMember(spaceId: string, input: CreateFamilyMemberInput): Promise<Family>;
  createRecurringLine(
    spaceId: string,
    input: CreateRecurringLineInput,
  ): Promise<Family>;
  createParticipationLine(
    spaceId: string,
    input: CreateParticipationLineInput,
  ): Promise<Family>;
  createLoan(spaceId: string, input: CreateLoanInput): Promise<Family>;
  createLoanRepaymentLine(
    spaceId: string,
    input: CreateLoanRepaymentLineInput,
  ): Promise<Family>;
  deleteLoan(spaceId: string, loanId: string): Promise<Family>;
  deleteLoanRepaymentLine(spaceId: string, lineId: string): Promise<Family>;
  deleteParticipationLine(spaceId: string, lineId: string): Promise<Family>;
  deleteCategory(spaceId: string, categoryId: string): Promise<Family>;
  deleteMember(spaceId: string, memberId: string): Promise<Family>;
  deleteRecurringLine(spaceId: string, lineId: string): Promise<Family>;
  getFamily(spaceId: string): Promise<Family>;
  updateMember(
    spaceId: string,
    memberId: string,
    input: UpdateFamilyMemberInput,
  ): Promise<Family>;
  updateParticipationLine(
    spaceId: string,
    lineId: string,
    input: UpdateParticipationLineInput,
  ): Promise<Family>;
  updateLoan(
    spaceId: string,
    loanId: string,
    input: UpdateLoanInput,
  ): Promise<Family>;
  updateLoanRepaymentLine(
    spaceId: string,
    lineId: string,
    input: UpdateLoanRepaymentLineInput,
  ): Promise<Family>;
  updateRecurringLine(
    spaceId: string,
    lineId: string,
    input: UpdateRecurringLineInput,
  ): Promise<Family>;
}
