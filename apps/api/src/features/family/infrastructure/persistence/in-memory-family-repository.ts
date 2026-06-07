import type {
  DistributionLine,
  FamilySnapshot,
  Loan,
  LoanRepaymentLine,
  ParticipationLine,
  RecurringLine,
} from "../../domain/family.js";
import type { FamilyRepository } from "../../domain/family-repository.js";

export function createInMemoryFamilyRepository(): FamilyRepository {
  const families = new Map<string, FamilySnapshot>();
  const familyIdsBySpaceId = new Map<string, string>();

  return {
    async createFamily(spaceId, family) {
      const snapshot = cloneFamily(family);
      families.set(snapshot.id, snapshot);
      familyIdsBySpaceId.set(spaceId, snapshot.id);

      return cloneFamily(snapshot);
    },

    async createRecurringLine(familyId, line) {
      const family = getFamily(families, familyId);
      const updatedFamily = {
        ...family,
        recurringLines: [...family.recurringLines, cloneLine(line)],
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async createParticipationLine(familyId, line) {
      const family = getFamily(families, familyId);
      const updatedFamily = {
        ...family,
        participationLines: [
          ...family.participationLines,
          cloneParticipationLine(line),
        ],
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async createDistributionLine(familyId, line) {
      const family = getFamily(families, familyId);
      const updatedFamily = {
        ...family,
        distributionLines: [
          ...family.distributionLines,
          cloneDistributionLine(line),
        ],
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async createLoan(familyId, loan) {
      const family = getFamily(families, familyId);
      const updatedFamily = {
        ...family,
        loans: [...family.loans, cloneLoan(loan)],
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async createLoanRepaymentLine(familyId, line) {
      const family = getFamily(families, familyId);
      const updatedFamily = {
        ...family,
        loanRepaymentLines: [
          ...family.loanRepaymentLines,
          cloneLoanRepaymentLine(line),
        ],
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async deleteLoan(familyId, loanId) {
      const family = getFamily(families, familyId);
      const loans = family.loans.filter((loan) => loan.id !== loanId);

      if (loans.length === family.loans.length) {
        return null;
      }

      const updatedFamily = {
        ...family,
        loanRepaymentLines: family.loanRepaymentLines.filter(
          (line) => line.loanId !== loanId,
        ),
        loans,
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async deleteLoanRepaymentLine(familyId, lineId) {
      const family = getFamily(families, familyId);
      const loanRepaymentLines = family.loanRepaymentLines.filter(
        (line) => line.id !== lineId,
      );

      if (loanRepaymentLines.length === family.loanRepaymentLines.length) {
        return null;
      }

      const updatedFamily = { ...family, loanRepaymentLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async deleteParticipationLine(familyId, lineId) {
      const family = getFamily(families, familyId);
      const participationLines = family.participationLines.filter(
        (line) => line.id !== lineId,
      );

      if (participationLines.length === family.participationLines.length) {
        return null;
      }

      const updatedFamily = { ...family, participationLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async deleteDistributionLine(familyId, lineId) {
      const family = getFamily(families, familyId);
      const distributionLines = family.distributionLines.filter(
        (line) => line.id !== lineId,
      );

      if (distributionLines.length === family.distributionLines.length) {
        return null;
      }

      const updatedFamily = { ...family, distributionLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async deleteRecurringLine(familyId, lineId) {
      const family = getFamily(families, familyId);
      const recurringLines = family.recurringLines.filter(
        (line) => line.id !== lineId,
      );

      if (recurringLines.length === family.recurringLines.length) {
        return null;
      }

      const updatedFamily = { ...family, recurringLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async deleteMember(familyId, memberId) {
      const family = getFamily(families, familyId);
      const hasMember = family.members.some((member) => member.id === memberId);

      if (!hasMember) {
        return null;
      }

      const linkedCategoryIds = new Set(
        family.categories
          .filter((category) => category.ownerId === memberId)
          .map((category) => category.id),
      );
      const updatedFamily = {
        ...family,
        categories: family.categories.filter(
          (category) => category.ownerId !== memberId,
        ),
        distributionLines: family.distributionLines.flatMap((line) => {
          const memberAmounts = line.memberAmounts.filter(
            (memberAmount) => memberAmount.memberId !== memberId,
          );

          return memberAmounts.length > 0 ? [{ ...line, memberAmounts }] : [];
        }),
        members: family.members.filter((member) => member.id !== memberId),
        participationLines: family.participationLines.filter(
          (line) => line.memberId !== memberId,
        ),
        recurringLines: family.recurringLines.filter(
          (line) => !linkedCategoryIds.has(line.categoryId),
        ),
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async deleteCategory(familyId, categoryId) {
      const family = getFamily(families, familyId);
      const hasCategory = family.categories.some(
        (category) => category.id === categoryId,
      );

      if (!hasCategory) {
        return null;
      }

      const updatedFamily = {
        ...family,
        categories: family.categories.filter(
          (category) => category.id !== categoryId,
        ),
        recurringLines: family.recurringLines.filter(
          (line) => line.categoryId !== categoryId,
        ),
      };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async findBySpaceId(spaceId) {
      const familyId = familyIdsBySpaceId.get(spaceId);
      const family = familyId ? families.get(familyId) : null;

      return family ? cloneFamily(family) : null;
    },

    async saveFamily(family) {
      const snapshot = cloneFamily(family);
      families.set(snapshot.id, snapshot);

      return cloneFamily(snapshot);
    },

    async updateRecurringLine(familyId, line) {
      const family = getFamily(families, familyId);
      const lineIndex = family.recurringLines.findIndex(
        (item) => item.id === line.id,
      );

      if (lineIndex === -1) {
        return null;
      }

      const recurringLines = [...family.recurringLines];
      recurringLines[lineIndex] = cloneLine(line);

      const updatedFamily = { ...family, recurringLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async updateParticipationLine(familyId, line) {
      const family = getFamily(families, familyId);
      const lineIndex = family.participationLines.findIndex(
        (item) => item.id === line.id,
      );

      if (lineIndex === -1) {
        return null;
      }

      const participationLines = [...family.participationLines];
      participationLines[lineIndex] = cloneParticipationLine(line);

      const updatedFamily = { ...family, participationLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async updateDistributionLine(familyId, line) {
      const family = getFamily(families, familyId);
      const lineIndex = family.distributionLines.findIndex(
        (item) => item.id === line.id,
      );

      if (lineIndex === -1) {
        return null;
      }

      const distributionLines = [...family.distributionLines];
      distributionLines[lineIndex] = cloneDistributionLine(line);

      const updatedFamily = { ...family, distributionLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async updateLoan(familyId, loan) {
      const family = getFamily(families, familyId);
      const loanIndex = family.loans.findIndex((item) => item.id === loan.id);

      if (loanIndex === -1) {
        return null;
      }

      const loans = [...family.loans];
      loans[loanIndex] = cloneLoan(loan);

      const updatedFamily = { ...family, loans };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },

    async updateLoanRepaymentLine(familyId, line) {
      const family = getFamily(families, familyId);
      const lineIndex = family.loanRepaymentLines.findIndex(
        (item) => item.id === line.id,
      );

      if (lineIndex === -1) {
        return null;
      }

      const loanRepaymentLines = [...family.loanRepaymentLines];
      loanRepaymentLines[lineIndex] = cloneLoanRepaymentLine(line);

      const updatedFamily = { ...family, loanRepaymentLines };
      families.set(familyId, updatedFamily);

      return cloneFamily(updatedFamily);
    },
  };
}

function getFamily(
  families: Map<string, FamilySnapshot>,
  familyId: string,
): FamilySnapshot {
  const family = families.get(familyId);

  if (!family) {
    throw new Error(`Family ${familyId} was not found.`);
  }

  return family;
}

function cloneFamily(family: FamilySnapshot): FamilySnapshot {
  return {
    ...family,
    categories: family.categories.map((category) => ({ ...category })),
    distributionLines: family.distributionLines.map(cloneDistributionLine),
    loanRepaymentLines: family.loanRepaymentLines.map(cloneLoanRepaymentLine),
    loans: family.loans.map(cloneLoan),
    members: family.members.map((member) => ({ ...member })),
    participationLines: family.participationLines.map(cloneParticipationLine),
    recurringLines: family.recurringLines.map(cloneLine),
  };
}

function cloneLine(line: RecurringLine): RecurringLine {
  return { ...line };
}

function cloneParticipationLine(line: ParticipationLine): ParticipationLine {
  return { ...line };
}

function cloneDistributionLine(line: DistributionLine): DistributionLine {
  return {
    ...line,
    memberAmounts: line.memberAmounts.map((memberAmount) => ({
      ...memberAmount,
    })),
  };
}

function cloneLoan(loan: Loan): Loan {
  return { ...loan };
}

function cloneLoanRepaymentLine(line: LoanRepaymentLine): LoanRepaymentLine {
  return { ...line };
}
