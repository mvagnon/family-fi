import type { Family, FamilyMember, ParticipationLine } from "./family";

const monthIndexes = Array.from({ length: 12 }, (_, index) => index);

export interface FamilyParticipationLine {
  line: ParticipationLine;
  member: FamilyMember;
  monthlyValue: number;
}

export interface FamilyParticipationMemberMonthGroup {
  id: string;
  lines: FamilyParticipationLine[];
  member: FamilyMember;
  total: number;
}

export interface FamilyParticipationMonthGroup {
  id: string;
  lines: FamilyParticipationLine[];
  memberGroups: FamilyParticipationMemberMonthGroup[];
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
  monthGroups: FamilyParticipationMonthGroup[];
  selectableMembers: FamilyMember[];
  selectedMember: FamilyMember | null;
  selectedMemberParticipation: FamilyMemberParticipation | null;
}

export type ParticipationMemberResolution =
  | { member: FamilyMember; status: "available" }
  | { status: "inactive-member" | "missing-member" };

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
  const participationLines = getParticipationLines(family, membersById, input);
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
      monthGroups: buildMonthGroups(lines, [member], input.year),
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
    monthGroups: buildMonthGroups(
      participationLines,
      family.members,
      input.year,
    ),
    selectableMembers: family.members,
    selectedMember,
    selectedMemberParticipation,
  };
}

export function resolveParticipationLineMember(
  family: Family,
  memberId: string,
): ParticipationMemberResolution {
  const member = family.members.find((item) => item.id === memberId);

  if (!member) {
    return { status: "missing-member" };
  }

  if (!member.isActive) {
    return { status: "inactive-member" };
  }

  return { member, status: "available" };
}

function getParticipationLines(
  family: Family,
  membersById: Map<string, FamilyMember>,
  input: FamilyParticipationProjectionInput,
): FamilyParticipationLine[] {
  return family.participationLines.flatMap((line) => {
    const member = membersById.get(line.memberId);

    if (!member || line.year !== input.year) {
      return [];
    }

    return [
      {
        line,
        member,
        monthlyValue: -line.amount,
      },
    ];
  });
}

function buildMonthGroups(
  lines: FamilyParticipationLine[],
  members: FamilyMember[],
  year: number,
): FamilyParticipationMonthGroup[] {
  return monthIndexes.map((monthIndex) => {
    const month = monthIndex + 1;
    const monthLines = lines.filter((line) => line.line.month === month);
    const monthId = `${year}-${String(month).padStart(2, "0")}`;
    const memberGroups = members.map((member) => {
      const memberLines = monthLines.filter(
        (line) => line.member.id === member.id,
      );

      return {
        id: `${monthId}-${member.id}`,
        lines: memberLines,
        member,
        total: memberLines.reduce(
          (total, line) => total + line.monthlyValue,
          0,
        ),
      };
    });

    return {
      id: monthId,
      lines: monthLines,
      memberGroups,
      monthIndex,
      total: monthLines.reduce((total, line) => total + line.monthlyValue, 0),
      year,
    };
  });
}

function getParticipationSummary(
  lines: FamilyParticipationLine[],
): FamilyParticipationSummary {
  const expenses = lines.reduce((total, line) => total + line.line.amount, 0);

  return {
    difference: -expenses,
    expenses,
    income: 0,
  };
}
