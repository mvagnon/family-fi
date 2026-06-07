import {
  getVisibleMonthIndexes,
  roundCurrency,
} from "./family-finance-calculations";
import type { DistributionLine, Family, FamilyMember } from "./family";

export interface FamilyDistributionMemberAmount {
  amount: number;
  balanceDelta: number;
  member: FamilyMember;
}

export interface FamilyDistributionLine {
  balanceDelta: number;
  baseAmount: number;
  line: DistributionLine;
  memberAmounts: FamilyDistributionMemberAmount[];
  receivedAmount: number;
}

export interface FamilyDistributionMonthGroup {
  balanceDelta: number;
  baseAmount: number;
  id: string;
  lines: FamilyDistributionLine[];
  monthIndex: number;
  receivedAmount: number;
  year: number;
}

export interface FamilyDistributionMemberBalance {
  balance: number;
  member: FamilyMember;
}

export interface FamilyDistributionSummary {
  averageSalary: number;
  maxSalary: number;
  minSalary: number;
}

export interface FamilyDistributionProjection {
  activeMembers: FamilyMember[];
  memberBalances: FamilyDistributionMemberBalance[];
  monthGroups: FamilyDistributionMonthGroup[];
  summary: FamilyDistributionSummary;
}

interface FamilyDistributionProjectionInput {
  currentMonthIndex: number;
  currentYear: number;
  visibleMemberIds?: ReadonlySet<string>;
  year: number;
}

export function getFamilyDistributionProjection(
  family: Family,
  input: FamilyDistributionProjectionInput,
): FamilyDistributionProjection {
  const visibleMemberIds = input.visibleMemberIds;
  const members = visibleMemberIds
    ? family.members.filter((member) => visibleMemberIds.has(member.id))
    : family.members;
  const membersById = new Map(members.map((member) => [member.id, member]));
  const lines = getDistributionLines(family, membersById, input);
  const monthGroups = buildMonthGroups(lines, input);

  return {
    activeMembers: members.filter((member) => member.isActive),
    memberBalances: getMemberBalances(family),
    monthGroups,
    summary: getDistributionSummary(monthGroups),
  };
}

function getDistributionLines(
  family: Family,
  membersById: Map<string, FamilyMember>,
  input: FamilyDistributionProjectionInput,
): FamilyDistributionLine[] {
  return family.distributionLines.flatMap((line) => {
    if (line.year !== input.year || !isVisibleDistributionMonth(line, input)) {
      return [];
    }

    const memberAmounts = line.memberAmounts.flatMap((memberAmount) => {
      const member = membersById.get(memberAmount.memberId);

      if (!member) {
        return [];
      }

      return [
        {
          amount: memberAmount.amount,
          balanceDelta: roundCurrency(line.amount - memberAmount.amount),
          member,
        },
      ];
    });

    if (memberAmounts.length === 0) {
      return [];
    }

    const baseAmount = roundCurrency(line.amount * memberAmounts.length);
    const receivedAmount = roundCurrency(
      memberAmounts.reduce((total, memberAmount) => {
        return total + memberAmount.amount;
      }, 0),
    );

    return [
      {
        balanceDelta: roundCurrency(baseAmount - receivedAmount),
        baseAmount,
        line,
        memberAmounts,
        receivedAmount,
      },
    ];
  });
}

function buildMonthGroups(
  lines: FamilyDistributionLine[],
  input: FamilyDistributionProjectionInput,
): FamilyDistributionMonthGroup[] {
  return getVisibleMonthIndexes(input).map((monthIndex) => {
    const month = monthIndex + 1;
    const monthLines = lines.filter((line) => line.line.month === month);
    const monthId = `${input.year}-${String(month).padStart(2, "0")}`;
    const baseAmount = monthLines.reduce((total, line) => {
      return total + line.baseAmount;
    }, 0);
    const receivedAmount = monthLines.reduce((total, line) => {
      return total + line.receivedAmount;
    }, 0);

    return {
      balanceDelta: roundCurrency(baseAmount - receivedAmount),
      baseAmount: roundCurrency(baseAmount),
      id: monthId,
      lines: monthLines,
      monthIndex,
      receivedAmount: roundCurrency(receivedAmount),
      year: input.year,
    };
  });
}

function getMemberBalances(family: Family): FamilyDistributionMemberBalance[] {
  return family.members.map((member) => ({
    balance: roundCurrency(
      family.distributionLines.reduce((total, line) => {
        const memberAmount = line.memberAmounts.find((item) => {
          return item.memberId === member.id;
        });

        if (!memberAmount) {
          return total;
        }

        return total + line.amount - memberAmount.amount;
      }, 0),
    ),
    member,
  }));
}

function getDistributionSummary(
  monthGroups: FamilyDistributionMonthGroup[],
): FamilyDistributionSummary {
  if (monthGroups.length === 0) {
    return {
      averageSalary: 0,
      maxSalary: 0,
      minSalary: 0,
    };
  }

  const monthlyTotals = monthGroups.map((group) => group.receivedAmount);

  return {
    averageSalary: roundCurrency(
      monthlyTotals.reduce((total, value) => total + value, 0) /
        monthlyTotals.length,
    ),
    maxSalary: Math.max(...monthlyTotals),
    minSalary: Math.min(...monthlyTotals),
  };
}

function isVisibleDistributionMonth(
  line: DistributionLine,
  input: FamilyDistributionProjectionInput,
): boolean {
  if (line.year < input.currentYear) {
    return true;
  }

  if (line.year === input.currentYear) {
    return line.month <= input.currentMonthIndex + 1;
  }

  return false;
}
