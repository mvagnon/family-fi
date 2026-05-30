import assert from "node:assert/strict";
import test from "node:test";

import type { Family, RecurringLine } from "../../domain/family";
import {
  createDraftRecurringLine,
  toCreateRecurringLineInput,
  toUpdateRecurringLineInput,
} from "../family-line-commands";

const family: Family = {
  categories: [{ id: "budget", kind: "shared", label: "Budget" }],
  id: "family",
  members: [],
  recurringLines: [],
  userIds: ["user"],
};

const line: RecurringLine = {
  amount: 42,
  categoryId: "budget",
  description: "Description",
  id: "line-id",
  isEstimate: false,
  movement: "negative",
  recurrenceMonths: 1,
  title: "Line",
};

test("creates a draft recurring line without UI-owned business defaults", () => {
  const draft = createDraftRecurringLine(family, "draft-id");

  assert.deepEqual(draft, {
    amount: 0,
    categoryId: "budget",
    description: "",
    id: "draft-id",
    isEstimate: false,
    movement: "negative",
    recurrenceMonths: 1,
    title: "",
  });
});

test("maps a recurring line to create and update command payloads", () => {
  assert.deepEqual(toCreateRecurringLineInput(line), {
    amount: 42,
    categoryId: "budget",
    description: "Description",
    isEstimate: false,
    movement: "negative",
    recurrenceMonths: 1,
    title: "Line",
  });

  assert.deepEqual(toUpdateRecurringLineInput(line), {
    amount: 42,
    categoryId: "budget",
    description: "Description",
    isEstimate: false,
    movement: "negative",
    recurrenceMonths: 1,
    title: "Line",
  });
});
