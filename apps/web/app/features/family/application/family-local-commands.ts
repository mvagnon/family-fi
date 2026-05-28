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

export function addLocalFamilyCategory(
  family: Family,
  input: CreateFamilyCategoryInput,
  createId: CreateFamilyEntityId,
): Family {
  return {
    ...family,
    categories: [...family.categories, createCategory(input.label, createId)],
  };
}

export function addLocalFamilyMember(
  family: Family,
  input: CreateFamilyMemberInput,
  createId: CreateFamilyEntityId,
): Family {
  const member = createMember(input, createId);
  const category = input.categoryLabel
    ? createCategory(input.categoryLabel, createId, member.id)
    : null;

  return {
    ...family,
    categories: category ? [...family.categories, category] : family.categories,
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

export function deleteLocalRecurringLine(family: Family, lineId: string): Family {
  return {
    ...family,
    recurringLines: family.recurringLines.filter((line) => line.id !== lineId),
  };
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

function createMember(
  input: CreateFamilyMemberInput,
  createId: CreateFamilyEntityId,
): FamilyMember {
  return {
    id: createId("member", input.name),
    name: input.name,
    role: input.role,
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
