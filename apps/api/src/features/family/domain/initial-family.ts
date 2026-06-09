import type { FamilySnapshot } from "./family.js";

export function createInitialFamily(familyId = "family"): FamilySnapshot {
  return {
    categories: [],
    distributionLines: [],
    generatedRecurringLineSettings: [],
    id: familyId,
    loanRepaymentLines: [],
    loans: [],
    members: [],
    participationLines: [],
    recurringLines: [],
  };
}
