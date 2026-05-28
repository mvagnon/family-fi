import assert from "node:assert/strict";
import test from "node:test";

import { createApiApp } from "../../../../app.js";
import { createInMemoryFamilyRepository } from "../persistence/in-memory-family-repository.js";

test("family routes expose and mutate the current family snapshot", async () => {
  const app = createApiApp({
    familyRepository: createInMemoryFamilyRepository(),
  });

  const initialResponse = await app.request("/api/family");
  const initialFamily = await initialResponse.json();

  assert.equal(initialResponse.status, 200);
  assert.equal(initialFamily.recurringLines.length, 6);

  const categoryResponse = await app.request("/api/family/categories", {
    body: JSON.stringify({ label: "Santé" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const familyWithCategory = await categoryResponse.json();

  assert.equal(categoryResponse.status, 201);
  assert.equal(
    familyWithCategory.categories.some(
      (category: { label: string }) => category.label === "Santé",
    ),
    true,
  );

  const lineResponse = await app.request("/api/family/recurring-lines", {
    body: JSON.stringify({
      amount: 120,
      categoryId: "budget",
      description: "Forfait familial",
      isEstimate: false,
      movement: "negative",
      recurrenceMonths: 1,
      title: "Internet",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const familyWithLine = await lineResponse.json();

  assert.equal(lineResponse.status, 201);
  assert.equal(
    familyWithLine.recurringLines.some(
      (line: { title: string }) => line.title === "Internet",
    ),
    true,
  );
});
