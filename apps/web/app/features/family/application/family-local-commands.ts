import type { FamilyCategory, FamilyMember } from "../domain/family";

export type FamilyLocalValidationError =
  | "duplicateCategoryLabel"
  | "duplicateMemberName";

export function getDuplicateFamilyCategoryLabelError(
  categories: FamilyCategory[],
  label: string,
  ignoredCategoryIds: string[] = [],
): FamilyLocalValidationError | undefined {
  return hasFamilyCategoryLabel(categories, label, ignoredCategoryIds)
    ? "duplicateCategoryLabel"
    : undefined;
}

export function getDuplicateFamilyMemberNameError(
  members: FamilyMember[],
  name: string,
  ignoredMemberId?: string,
): FamilyLocalValidationError | undefined {
  return hasFamilyMemberName(members, name, ignoredMemberId)
    ? "duplicateMemberName"
    : undefined;
}

export function getFamilyMemberLinkedCategoryIds(
  categories: FamilyCategory[],
  memberId: string,
): string[] {
  return categories.flatMap((category) =>
    category.ownerId === memberId ? [category.id] : [],
  );
}

function hasFamilyCategoryLabel(
  categories: FamilyCategory[],
  label: string,
  ignoredCategoryIds: string[],
): boolean {
  const normalizedLabel = normalizeCategoryLabel(label);
  const ignoredCategoryIdSet = new Set(ignoredCategoryIds);

  return categories.some(
    (category) =>
      !ignoredCategoryIdSet.has(category.id) &&
      normalizeCategoryLabel(category.label) === normalizedLabel,
  );
}

function normalizeCategoryLabel(label: string): string {
  return label.trim().toLocaleLowerCase("fr-FR");
}

function hasFamilyMemberName(
  members: FamilyMember[],
  name: string,
  ignoredMemberId: string | undefined,
): boolean {
  const normalizedName = normalizeMemberName(name);

  return members.some(
    (member) =>
      member.id !== ignoredMemberId &&
      normalizeMemberName(member.name) === normalizedName,
  );
}

function normalizeMemberName(name: string): string {
  return name.trim().toLocaleLowerCase("fr-FR");
}
