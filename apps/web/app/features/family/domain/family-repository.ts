import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family,
  UpdateRecurringLineInput,
} from "./family";

export interface FamilyRepository {
  addCategory(input: CreateFamilyCategoryInput): Promise<Family>;
  addMember(input: CreateFamilyMemberInput): Promise<Family>;
  createRecurringLine(input: CreateRecurringLineInput): Promise<Family>;
  getFamily(): Promise<Family>;
  updateRecurringLine(
    lineId: string,
    input: UpdateRecurringLineInput,
  ): Promise<Family>;
}
