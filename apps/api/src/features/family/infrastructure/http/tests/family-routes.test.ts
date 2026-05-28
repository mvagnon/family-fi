import assert from "node:assert/strict";
import test from "node:test";

import { createApiApp } from "../../../../../app.js";
import { createInMemoryFamilyRepository } from "../../persistence/in-memory-family-repository.js";

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

test("family routes delete recurring lines", async () => {
  const app = createApiApp({
    familyRepository: createInMemoryFamilyRepository(),
  });

  await app.request("/api/family");

  const response = await app.request("/api/family/recurring-lines/rent", {
    method: "DELETE",
  });
  const family = await response.json();

  assert.equal(response.status, 200);
  assert.equal(
    family.recurringLines.some((line: { id: string }) => line.id === "rent"),
    false,
  );
});

test("family routes create members from names only", async () => {
  const app = createApiApp({
    familyRepository: createInMemoryFamilyRepository(),
  });

  const response = await app.request("/api/family/members", {
    body: JSON.stringify({ name: "Camille" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const family = await response.json();
  const member = family.members.find(
    (item: { name: string }) => item.name === "Camille",
  );

  assert.equal(response.status, 201);
  assert.equal(member?.role, "");
  assert.equal(
    family.categories.some(
      (category: { label: string; ownerId?: string }) =>
        category.label === "Camille" && category.ownerId === member?.id,
    ),
    true,
  );
});

test("family routes reject duplicate member names", async () => {
  const app = createApiApp({
    familyRepository: createInMemoryFamilyRepository(),
  });

  await app.request("/api/family");

  const response = await app.request("/api/family/members", {
    body: JSON.stringify({ name: " léa " }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    message: "Un membre avec ce nom existe déjà.",
  });
});

test("family routes reject duplicate category labels", async () => {
  const app = createApiApp({
    familyRepository: createInMemoryFamilyRepository(),
  });

  await app.request("/api/family");

  const response = await app.request("/api/family/categories", {
    body: JSON.stringify({ label: " budget " }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    message: "Une catégorie avec ce nom existe déjà.",
  });
});

test("family routes reject malformed JSON request bodies", async () => {
  const app = createApiApp({
    familyRepository: createInMemoryFamilyRepository(),
  });

  const response = await app.request("/api/family/categories", {
    body: "{",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, { message: "Request body must be a JSON object." });
});
