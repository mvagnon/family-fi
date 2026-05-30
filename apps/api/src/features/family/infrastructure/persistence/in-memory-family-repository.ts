import type { FamilySnapshot, RecurringLine } from "../../domain/family.js";
import type { FamilyRepository } from "../../domain/family-repository.js";

export function createInMemoryFamilyRepository(): FamilyRepository {
  const families = new Map<string, FamilySnapshot>();

  return {
    async createFamily(family) {
      const snapshot = cloneFamily(family);
      families.set(snapshot.id, snapshot);

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
        members: family.members.filter((member) => member.id !== memberId),
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

    async findByUserId(userId) {
      const family = Array.from(families.values()).find((item) =>
        item.userIds.includes(userId),
      );

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
    members: family.members.map((member) => ({ ...member })),
    recurringLines: family.recurringLines.map(cloneLine),
    userIds: [...family.userIds],
  };
}

function cloneLine(line: RecurringLine): RecurringLine {
  return { ...line };
}
