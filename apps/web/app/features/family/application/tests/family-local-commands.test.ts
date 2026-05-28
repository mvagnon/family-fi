import assert from "node:assert/strict";
import test from "node:test";

import type { Family } from "../../domain/family";
import {
  addLocalFamilyCategory,
  addLocalFamilyMember,
  createLocalRecurringLine,
  updateLocalRecurringLine,
} from "../family-local-commands";

const family: Family = {
  categories: [{ id: "budget", kind: "shared", label: "Budget" }],
  id: "family",
  members: [],
  recurringLines: [
    {
      amount: 10,
      categoryId: "budget",
      description: "Old",
      id: "line-internet",
      isEstimate: false,
      movement: "negative",
      recurrenceMonths: 1,
      title: "Internet",
    },
  ],
  userIds: ["user"],
};

test("adds a local member with its linked professional category", () => {
  const result = addLocalFamilyMember(
    family,
    {
      categoryLabel: "Camille Pro",
      name: "Camille",
      role: "Parent",
    },
    (prefix, label) => `${prefix}-${label}`,
  );

  assert.equal(result.members[0]?.id, "member-Camille");
  assert.deepEqual(result.categories[1], {
    id: "category-Camille Pro",
    kind: "professional",
    label: "Camille Pro",
    ownerId: "member-Camille",
  });
});

test("adds and updates local recurring lines without mutating the source family", () => {
  const withCategory = addLocalFamilyCategory(
    family,
    { label: "Santé" },
    (prefix, label) => `${prefix}-${label}`,
  );
  const withLine = createLocalRecurringLine(
    withCategory,
    {
      amount: 50,
      categoryId: "category-Santé",
      description: "Mutuelle",
      isEstimate: false,
      movement: "negative",
      recurrenceMonths: 1,
      title: "Mutuelle",
    },
    "line-mutuelle",
  );
  const updated = updateLocalRecurringLine(withLine, "line-mutuelle", {
    amount: 75,
    categoryId: "category-Santé",
    description: "Mutuelle famille",
    isEstimate: false,
    movement: "negative",
    recurrenceMonths: 1,
    title: "Mutuelle",
  });

  assert.equal(family.categories.length, 1);
  assert.equal(withCategory.categories.at(-1)?.label, "Santé");
  assert.equal(withLine.recurringLines.at(-1)?.id, "line-mutuelle");
  assert.equal(updated.recurringLines.at(-1)?.amount, 75);
});
