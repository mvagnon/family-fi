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
