import assert from "node:assert/strict";
import test from "node:test";

import { FamilyApiError, parseFamilyResponse } from "../family-dto";

const validFamilyResponse = {
  categories: [{ id: "budget", kind: "shared", label: "Budget" }],
  id: "family",
  members: [{ id: "lea", name: "Léa", role: "Parent" }],
  recurringLines: [
    {
      amount: 100,
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

test("parses a valid family API response into the domain model", () => {
  const family = parseFamilyResponse(validFamilyResponse);

  assert.equal(family.id, "family");
  assert.equal(family.categories[0]?.kind, "shared");
  assert.equal(family.recurringLines[0]?.amount, 100);
});

test("rejects invalid nested family API response values", () => {
  assert.throws(
    () =>
      parseFamilyResponse({
        ...validFamilyResponse,
        recurringLines: [
          {
            ...validFamilyResponse.recurringLines[0],
            amount: "100",
          },
        ],
      }),
    FamilyApiError,
  );
});
