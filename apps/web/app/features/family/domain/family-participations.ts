import { getMonthlyRange } from "./family-budget";
import type {
  Family,
  FamilyCategory,
  FamilyMember,
  RecurringLine,
} from "./family";

const monthIndexes = Array.from({ length: 12 }, (_, index) => index);

export interface FamilyParticipationLine {
  category: FamilyCategory;
  line: RecurringLine;
  member: FamilyMember;
  monthlyValue: number;
}

export interface FamilyParticipationMonthGroup {
  id: string;
  lines: FamilyParticipationLine[];
  monthIndex: number;
  total: number;
  year: number;
}

export interface FamilyParticipationSummary {
  difference: number;
  expenses: number;
  income: number;
}

export interface FamilyMemberParticipation {
  lines: FamilyParticipationLine[];
  member: FamilyMember;
  monthGroups: FamilyParticipationMonthGroup[];
  summary: FamilyParticipationSummary;
}

export interface FamilyParticipationProjection {
  activeMembers: FamilyMember[];
  memberParticipations: FamilyMemberParticipation[];
  selectableMembers: FamilyMember[];
  selectedMember: FamilyMember | null;
  selectedMemberParticipation: FamilyMemberParticipation | null;
}

export interface ParticipationCreationOption {
  category: FamilyCategory | null;
  member: FamilyMember;
}

export type ParticipationCategoryResolution =
  | { category: FamilyCategory; member: FamilyMember; status: "available" }
  | {
      status:
        | "inactive-member"
        | "missing-member"
        | "missing-professional-category";
    };

interface FamilyParticipationProjectionInput {
  selectedMemberId?: string | null;
  year: number;
}

export function getFamilyParticipationProjection(
  family: Family,
  input: FamilyParticipationProjectionInput,
): FamilyParticipationProjection {
  const membersById = new Map(
    family.members.map((member) => [member.id, member]),
  );
  const participationLines = getParticipationLines(family, membersById);
  const linesByMemberId = new Map<string, FamilyParticipationLine[]>();

  for (const line of participationLines) {
    const memberLines = linesByMemberId.get(line.member.id) ?? [];
    memberLines.push(line);
    linesByMemberId.set(line.member.id, memberLines);
  }

  const memberParticipations = family.members.map((member) => {
    const lines = linesByMemberId.get(member.id) ?? [];

    return {
      lines,
      member,
      monthGroups: buildMonthGroups(lines, input.year),
      summary: getParticipationSummary(lines),
    };
  });
  const selectedMember =
    family.members.find((member) => member.id === input.selectedMemberId) ??
    family.members[0] ??
    null;
  const selectedMemberParticipation =
    memberParticipations.find(
      (participation) => participation.member.id === selectedMember?.id,
    ) ?? null;

  return {
    activeMembers: family.members.filter((member) => member.isActive),
    memberParticipations,
    selectableMembers: family.members,
    selectedMember,
    selectedMemberParticipation,
  };
}

export function getParticipationCreationOptions(
  family: Family,
): ParticipationCreationOption[] {
  return family.members
    .filter((member) => member.isActive)
    .map((member) => ({
      category: findProfessionalCategoryForMember(family.categories, member.id),
      member,
    }));
}

export function resolveParticipationLineCategory(
  family: Family,
  categoryId: string,
): ParticipationCategoryResolution {
  const category = family.categories.find((item) => item.id === categoryId);

  if (!category || category.kind !== "professional" || !category.ownerId) {
    return { status: "missing-professional-category" };
  }

  const member = family.members.find((item) => item.id === category.ownerId);

  if (!member) {
    return { status: "missing-member" };
  }

  if (!member.isActive) {
    return { status: "inactive-member" };
  }

  return { category, member, status: "available" };
}

export function findProfessionalCategoryForMember(
  categories: FamilyCategory[],
  memberId: string,
): FamilyCategory | null {
  return (
    categories.find(
      (category) =>
        category.kind === "professional" && category.ownerId === memberId,
    ) ?? null
  );
}

function getParticipationLines(
  family: Family,
  membersById: Map<string, FamilyMember>,
): FamilyParticipationLine[] {
  const professionalCategoriesById = new Map(
    family.categories
      .filter(
        (category) =>
          category.kind === "professional" &&
          category.ownerId &&
          membersById.has(category.ownerId),
      )
      .map((category) => [category.id, category]),
  );

  return family.recurringLines.flatMap((line) => {
    const category = professionalCategoriesById.get(line.categoryId);
    const member = category?.ownerId
      ? membersById.get(category.ownerId)
      : undefined;

    if (!category || !member) {
      return [];
    }

    return [
      {
        category,
        line,
        member,
        monthlyValue: getMonthlyRange(line).avg,
      },
    ];
  });
}

function buildMonthGroups(
  lines: FamilyParticipationLine[],
  year: number,
): FamilyParticipationMonthGroup[] {
  return monthIndexes.map((monthIndex) => ({
    id: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    lines,
    monthIndex,
    total: lines.reduce((total, line) => total + line.monthlyValue, 0),
    year,
  }));
}

function getParticipationSummary(
  lines: FamilyParticipationLine[],
): FamilyParticipationSummary {
  const totals = lines.reduce(
    (summary, line) => {
      if (line.monthlyValue >= 0) {
        return {
          ...summary,
          income: summary.income + line.monthlyValue,
        };
      }

      return {
        ...summary,
        expenses: summary.expenses + Math.abs(line.monthlyValue),
      };
    },
    { expenses: 0, income: 0 },
  );

  return {
    difference: totals.income - totals.expenses,
    expenses: totals.expenses,
    income: totals.income,
  };
}
