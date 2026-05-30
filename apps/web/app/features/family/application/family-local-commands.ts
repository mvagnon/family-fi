import type { FamilyCategory, FamilyMember } from "../domain/family";

export type FamilyLocalValidationError =
  | "duplicateCategoryLabel"
  | "duplicateMemberName";

export function getDuplicateFamilyCategoryLabelError(
  categories: FamilyCategory[],
  label: string,
): FamilyLocalValidationError | undefined {
  return hasFamilyCategoryLabel(categories, label)
    ? "duplicateCategoryLabel"
    : undefined;
}

export function getDuplicateFamilyMemberNameError(
  members: FamilyMember[],
  name: string,
): FamilyLocalValidationError | undefined {
  return hasFamilyMemberName(members, name) ? "duplicateMemberName" : undefined;
}

function hasFamilyCategoryLabel(
  categories: FamilyCategory[],
  label: string,
): boolean {
  const normalizedLabel = normalizeCategoryLabel(label);

  return categories.some(
    (category) => normalizeCategoryLabel(category.label) === normalizedLabel,
  );
}

function normalizeCategoryLabel(label: string): string {
  return label.trim().toLocaleLowerCase("fr-FR");
}

function hasFamilyMemberName(members: FamilyMember[], name: string): boolean {
  const normalizedName = normalizeMemberName(name);

  return members.some(
    (member) => normalizeMemberName(member.name) === normalizedName,
  );
}

function normalizeMemberName(name: string): string {
  return name.trim().toLocaleLowerCase("fr-FR");
}
