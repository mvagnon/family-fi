import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateParticipationLineInput,
  CreateRecurringLineInput,
  Family,
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
  deleteCategory(spaceId: string, categoryId: string): Promise<Family>;
  deleteMember(spaceId: string, memberId: string): Promise<Family>;
  deleteRecurringLine(spaceId: string, lineId: string): Promise<Family>;
  getFamily(spaceId: string): Promise<Family>;
  updateRecurringLine(
    spaceId: string,
    lineId: string,
    input: UpdateRecurringLineInput,
  ): Promise<Family>;
}
