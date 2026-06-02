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

export interface FamilyParticipationProjection {
  activeMembers: FamilyMember[];
  monthGroups: FamilyParticipationMonthGroup[];
  summary: FamilyParticipationSummary;
}

export type ParticipationMemberResolution =
  | { member: FamilyMember; status: "available" }
  | { status: "inactive-member" | "missing-member" };

interface FamilyParticipationProjectionInput {
  currentMonthIndex: number;
  currentYear: number;
  visibleMemberIds?: ReadonlySet<string>;
  year: number;
}

export function getFamilyParticipationProjection(
  family: Family,
  input: FamilyParticipationProjectionInput,
): FamilyParticipationProjection {
  const visibleMemberIds = input.visibleMemberIds;
  const members = visibleMemberIds
    ? family.members.filter((member) => visibleMemberIds.has(member.id))
    : family.members;
  const membersById = new Map(members.map((member) => [member.id, member]));
  const participationLines = getParticipationLines(family, membersById, input);

  return {
    activeMembers: members.filter((member) => member.isActive),
    monthGroups: buildMonthGroups(participationLines, members, input),
    summary: getParticipationSummary(participationLines),
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

    if (
      !member ||
      line.year !== input.year ||
      !isVisibleParticipationMonth(line, input)
    ) {
      return [];
    }

    return [
      {
        line,
        member,
        monthlyValue: line.amount,
      },
    ];
  });
}

function isVisibleParticipationMonth(
  line: ParticipationLine,
  input: FamilyParticipationProjectionInput,
): boolean {
  if (line.year < input.currentYear) {
    return true;
  }

  if (line.year === input.currentYear) {
    return line.month <= input.currentMonthIndex + 1;
  }

  return false;
}

function buildMonthGroups(
  lines: FamilyParticipationLine[],
  members: FamilyMember[],
  input: FamilyParticipationProjectionInput,
): FamilyParticipationMonthGroup[] {
  return getVisibleMonthIndexes(input).map((monthIndex) => {
    const month = monthIndex + 1;
    const monthLines = lines.filter((line) => line.line.month === month);
    const monthId = `${input.year}-${String(month).padStart(2, "0")}`;
    const memberGroups = members.flatMap((member) => {
      const memberLines = monthLines.filter(
        (line) => line.member.id === member.id,
      );

      if (!member.isActive && memberLines.length === 0) {
        return [];
      }

      return [
        {
          id: `${monthId}-${member.id}`,
          lines: memberLines,
          member,
          total: memberLines.reduce(
            (total, line) => total + line.monthlyValue,
            0,
          ),
        },
      ];
    });

    return {
      id: monthId,
      lines: monthLines,
      memberGroups,
      monthIndex,
      total: monthLines.reduce((total, line) => total + line.monthlyValue, 0),
      year: input.year,
    };
  });
}

function getVisibleMonthIndexes(
  input: FamilyParticipationProjectionInput,
): number[] {
  if (input.year > input.currentYear) {
    return [];
  }

  if (input.year === input.currentYear) {
    return monthIndexes.filter(
      (monthIndex) => monthIndex <= input.currentMonthIndex,
    );
  }

  return monthIndexes;
}

function getParticipationSummary(
  lines: FamilyParticipationLine[],
): FamilyParticipationSummary {
  const totals = lines.reduce(
    (summary, line) => {
      if (line.line.amount > 0) {
        return {
          ...summary,
          income: summary.income + line.line.amount,
        };
      }

      return {
        ...summary,
        expenses: summary.expenses + Math.abs(line.line.amount),
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
