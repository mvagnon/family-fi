import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family,
  FamilyCategory,
  FamilyMember,
  UpdateRecurringLineInput,
} from "../domain/family";

export type CreateFamilyEntityId = (prefix: string, label: string) => string;

export const duplicateFamilyCategoryLabelMessage =
  "Une catégorie avec ce nom existe déjà.";
export const duplicateFamilyMemberNameMessage =
  "Un membre avec ce nom existe déjà.";

export function addLocalFamilyCategory(
  family: Family,
  input: CreateFamilyCategoryInput,
  createId: CreateFamilyEntityId,
): Family {
  const label = input.label.trim();

  assertUniqueFamilyCategoryLabel(family.categories, label);

  return {
    ...family,
    categories: [...family.categories, createCategory(label, createId)],
  };
}

export function addLocalFamilyMember(
  family: Family,
  input: CreateFamilyMemberInput,
  createId: CreateFamilyEntityId,
): Family {
  const name = input.name.trim();

  assertUniqueFamilyMemberName(family.members, name);
  assertUniqueFamilyCategoryLabel(family.categories, name);

  const member = createMember(name, createId);
  const category = createCategory(name, createId, member.id);

  return {
    ...family,
    categories: [...family.categories, category],
    members: [...family.members, member],
  };
}

export function createLocalRecurringLine(
  family: Family,
  input: CreateRecurringLineInput,
  lineId: string,
): Family {
  return {
    ...family,
    recurringLines: [...family.recurringLines, { ...input, id: lineId }],
  };
}

export function updateLocalRecurringLine(
  family: Family,
  lineId: string,
  input: UpdateRecurringLineInput,
): Family {
  return {
    ...family,
    recurringLines: family.recurringLines.map((line) =>
      line.id === lineId ? { ...input, id: lineId } : line,
    ),
  };
}

export function deleteLocalRecurringLine(
  family: Family,
  lineId: string,
): Family {
  return {
    ...family,
    recurringLines: family.recurringLines.filter((line) => line.id !== lineId),
  };
}

export function deleteLocalFamilyMember(
  family: Family,
  memberId: string,
): Family {
  return {
    ...family,
    categories: family.categories.filter(
      (category) => category.ownerId !== memberId,
    ),
    members: family.members.filter((member) => member.id !== memberId),
  };
}

export function deleteLocalFamilyCategory(
  family: Family,
  categoryId: string,
): Family {
  return {
    ...family,
    categories: family.categories.filter(
      (category) => category.id !== categoryId,
    ),
  };
}

export function getDuplicateFamilyCategoryLabelMessage(
  categories: FamilyCategory[],
  label: string,
): string | undefined {
  if (hasFamilyCategoryLabel(categories, label)) {
    return duplicateFamilyCategoryLabelMessage;
  }

  return undefined;
}

export function getDuplicateFamilyMemberNameMessage(
  members: FamilyMember[],
  name: string,
): string | undefined {
  if (hasFamilyMemberName(members, name)) {
    return duplicateFamilyMemberNameMessage;
  }

  return undefined;
}

export function createSluggedFamilyEntityId(
  prefix: string,
  label: string,
  suffix: string,
): string {
  const normalizedLabel = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${prefix}-${normalizedLabel || "item"}-${suffix}`;
}

function assertUniqueFamilyCategoryLabel(
  categories: FamilyCategory[],
  label: string,
) {
  const duplicateMessage = getDuplicateFamilyCategoryLabelMessage(
    categories,
    label,
  );

  if (duplicateMessage) {
    throw new Error(duplicateMessage);
  }
}

function assertUniqueFamilyMemberName(members: FamilyMember[], name: string) {
  const duplicateMessage = getDuplicateFamilyMemberNameMessage(members, name);

  if (duplicateMessage) {
    throw new Error(duplicateMessage);
  }
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

function createMember(
  name: string,
  createId: CreateFamilyEntityId,
): FamilyMember {
  return {
    id: createId("member", name),
    name,
    role: "",
  };
}

function createCategory(
  label: string,
  createId: CreateFamilyEntityId,
  ownerId?: string,
): FamilyCategory {
  return {
    id: createId("category", label),
    kind: ownerId ? "professional" : "shared",
    label,
    ownerId,
  };
}
