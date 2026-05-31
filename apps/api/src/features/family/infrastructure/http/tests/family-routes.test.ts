import assert from "node:assert/strict";
import test from "node:test";

import { createApiApp } from "../../../../../app.js";
import type { AuthProvider } from "../../../../auth/domain/auth.js";
import { createInMemorySpacesRepository } from "../../../../spaces/infrastructure/persistence/in-memory-spaces-repository.js";
import { createInMemoryFamilyRepository } from "../../persistence/in-memory-family-repository.js";

const TEST_USER_ID = "test-user";
const TEST_SPACE_ID = "test-space";
const familyPath = `/api/spaces/${TEST_SPACE_ID}/family`;

test("family routes expose and mutate the current family snapshot", async () => {
  const app = createTestApp();

  const initialResponse = await authenticatedRequest(app, familyPath);
  const initialFamily = await initialResponse.json();

  assert.equal(initialResponse.status, 200);
  assert.equal(initialFamily.recurringLines.length, 6);

  const categoryResponse = await authenticatedRequest(
    app,
    `${familyPath}/categories`,
    {
      body: JSON.stringify({ label: "Santé" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const familyWithCategory = await categoryResponse.json();

  assert.equal(categoryResponse.status, 201);
  assert.equal(
    familyWithCategory.categories.some(
      (category: { label: string }) => category.label === "Santé",
    ),
    true,
  );

  const lineResponse = await authenticatedRequest(
    app,
    `${familyPath}/recurring-lines`,
    {
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
    },
  );
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
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(
    app,
    `${familyPath}/recurring-lines/rent`,
    {
      method: "DELETE",
    },
  );
  const family = await response.json();

  assert.equal(response.status, 200);
  assert.equal(
    family.recurringLines.some((line: { id: string }) => line.id === "rent"),
    false,
  );
});

test("family routes create members from names only", async () => {
  const app = createTestApp();

  const response = await authenticatedRequest(app, `${familyPath}/members`, {
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
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(app, `${familyPath}/members`, {
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
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(app, `${familyPath}/categories`, {
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
  const app = createTestApp();

  const response = await authenticatedRequest(app, `${familyPath}/categories`, {
    body: "{",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, { message: "Request body must be a JSON object." });
});

test("family routes reject unauthenticated requests", async () => {
  const app = createTestApp();

  const response = await app.request(familyPath);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.deepEqual(body, { message: "Authentication is required." });
});

test("family routes reject spaces without membership", async () => {
  const app = createTestApp();

  const response = await authenticatedRequest(
    app,
    "/api/spaces/other-space/family",
  );
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.deepEqual(body, { message: "Space is not accessible." });
});

function createTestApp() {
  return createApiApp({
    authProvider: createTestAuthProvider(),
    familyRepository: createInMemoryFamilyRepository(),
    spaceRepository: createInMemorySpacesRepository({
      memberships: [
        {
          role: "owner",
          spaceId: TEST_SPACE_ID,
          userId: TEST_USER_ID,
        },
      ],
      settings: new Map([[TEST_USER_ID, TEST_SPACE_ID]]),
      spaces: [
        {
          id: TEST_SPACE_ID,
          name: "Test space",
        },
      ],
    }),
  });
}

function createTestAuthProvider(): AuthProvider {
  return {
    async getSession(request) {
      const userId = request.headers.get("x-user-id");

      if (!userId) {
        return null;
      }

      return {
        user: {
          email: "test@test.com",
          id: userId,
          name: "Test User",
        },
      };
    },
    handleRequest: () => new Response(null, { status: 404 }),
  };
}

function authenticatedRequest(
  app: ReturnType<typeof createApiApp>,
  path: string,
  init: RequestInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("x-user-id", TEST_USER_ID);

  return app.request(path, {
    ...init,
    headers,
  });
}
