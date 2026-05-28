import assert from "node:assert/strict";
import test from "node:test";

import type { CreateFamilyCategoryInput } from "../../domain/family";
import {
  createFamilyHttpRepository,
  FamilyApiError,
} from "../family-http-repository";

const familyResponse = {
  categories: [{ id: "budget", kind: "shared", label: "Budget" }],
  id: "family",
  members: [{ id: "lea", name: "Lea", role: "Parent" }],
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

test("posts family category metadata through the HTTP repository", async () => {
  const requests: Request[] = [];
  const repository = createFamilyHttpRepository({
    apiBaseUrl: "http://api.test/",
    fetcher: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);

      return Response.json(familyResponse);
    },
  });
  const input: CreateFamilyCategoryInput = {
    kind: "professional",
    label: "Camille Pro",
    ownerId: "member-camille",
  };

  await repository.addCategory(input);

  assert.equal(requests.length, 1);
  assert.equal(requests[0]?.url, "http://api.test/api/family/categories");
  assert.equal(requests[0]?.method, "POST");
  assert.deepEqual(await requests[0]?.json(), input);
});

test("deletes recurring lines through the HTTP repository", async () => {
  const requests: Request[] = [];
  const repository = createFamilyHttpRepository({
    apiBaseUrl: "http://api.test/",
    fetcher: async (input, init) => {
      const request = new Request(input, init);
      requests.push(request);

      return Response.json({
        ...familyResponse,
        recurringLines: [],
      });
    },
  });

  const family = await repository.deleteRecurringLine("internet");

  assert.equal(requests.length, 1);
  assert.equal(
    requests[0]?.url,
    "http://api.test/api/family/recurring-lines/internet",
  );
  assert.equal(requests[0]?.method, "DELETE");
  assert.equal(family.recurringLines.length, 0);
});

test("raises a family API error when the HTTP repository receives an error response", async () => {
  const repository = createFamilyHttpRepository({
    apiBaseUrl: "http://api.test",
    fetcher: async () =>
      Response.json({ message: "Category kind is invalid." }, { status: 400 }),
  });

  await assert.rejects(
    () =>
      repository.addCategory({
        kind: "professional",
        label: "Camille Pro",
        ownerId: "member-camille",
      }),
    new FamilyApiError("Category kind is invalid."),
  );
});
