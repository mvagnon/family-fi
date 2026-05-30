import assert from "node:assert/strict";
import test from "node:test";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import type { Family } from "../../domain/family";
import { FamilyDashboard } from "../family-dashboard";

const family: Family = {
  categories: [{ id: "budget", kind: "shared", label: "Budget" }],
  id: "family",
  members: [{ id: "lea", name: "Léa", role: "Parent" }],
  recurringLines: [
    {
      amount: 120,
      categoryId: "budget",
      description: "Internet",
      id: "internet",
      isEstimate: false,
      movement: "negative",
      recurrenceMonths: 1,
      title: "Internet",
    },
  ],
  userIds: ["dev-user"],
};

test("renders mutation errors in a snackbar", () => {
  const markup = renderToStaticMarkup(
    createElement(FamilyDashboard, {
      family,
      mutationError: "La ligne n'a pas pu être supprimée.",
      onAddCategory: () => {},
      onAddMember: () => {},
      onCreateRecurringLine: () => {},
      onDeleteCategory: () => {},
      onDeleteMember: () => {},
      onDeleteRecurringLine: () => {},
      onUpdateRecurringLine: () => {},
    }),
  );

  assert.equal(markup.includes("MuiSnackbar-root"), true);
  assert.equal(
    markup.includes("La ligne n&#x27;a pas pu être supprimée."),
    true,
  );
});
