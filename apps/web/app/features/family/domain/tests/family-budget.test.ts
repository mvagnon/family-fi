import assert from "node:assert/strict";
import test from "node:test";

import type { FamilyCategory, RecurringLine } from "../family";
import { getCategoryGroups, getFamilyBudgetSummary } from "../family-budget";

const categories: FamilyCategory[] = [
  { id: "housing", kind: "shared", label: "Logement" },
  { id: "income", kind: "professional", label: "Revenus", ownerId: "lea" },
];

const lines: RecurringLine[] = [
  {
    amount: 3000,
    categoryId: "income",
    description: "Salaire net",
    id: "salary",
    isEstimate: false,
    movement: "positive",
    recurrenceMonths: 1,
    title: "Salaire",
  },
  {
    amount: 1200,
    categoryId: "housing",
    description: "Loyer variable",
    id: "rent",
    isEstimate: true,
    maxAmount: 1400,
    minAmount: 1000,
    movement: "negative",
    recurrenceMonths: 1,
    title: "Loyer",
  },
  {
    amount: 600,
    categoryId: "unknown",
    description: "Prime trimestrielle",
    id: "bonus",
    isEstimate: false,
    movement: "positive",
    recurrenceMonths: 3,
    title: "Prime",
  },
];

test("groups recurring lines by known categories and keeps orphan groups", () => {
  const groups = getCategoryGroups(categories, lines);

  assert.deepEqual(
    groups.map((group) => ({
      id: group.id,
      lineIds: group.lines.map((line) => line.id),
    })),
    [
      { id: "housing", lineIds: ["rent"] },
      { id: "income", lineIds: ["salary"] },
      { id: "unknown", lineIds: ["bonus"] },
    ],
  );
});

test("computes signed monthly and annual budget ranges", () => {
  const summary = getFamilyBudgetSummary(lines);

  assert.deepEqual(summary.monthly, {
    avg: 2000,
    max: 2200,
    min: 1800,
  });
  assert.deepEqual(summary.annual, {
    avg: 24000,
    max: 26400,
    min: 21600,
  });
});
