import type { FamilySnapshot, RecurringLine } from "./family.js";

export interface FamilyRepository {
  createFamily(family: FamilySnapshot): Promise<FamilySnapshot>;
  createRecurringLine(
    familyId: string,
    line: RecurringLine,
  ): Promise<FamilySnapshot>;
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
  findByUserId(userId: string): Promise<FamilySnapshot | null>;
  saveFamily(family: FamilySnapshot): Promise<FamilySnapshot>;
  updateRecurringLine(
    familyId: string,
    line: RecurringLine,
  ): Promise<FamilySnapshot | null>;
}
