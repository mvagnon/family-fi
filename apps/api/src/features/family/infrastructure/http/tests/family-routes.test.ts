import assert from "node:assert/strict";
import test from "node:test";

import { createApiApp } from "../../../../../app.js";
import type { AuthHttpAdapter } from "../../../../auth/infrastructure/better-auth-provider.js";
import { createInMemorySpacesRepository } from "../../../../spaces/infrastructure/persistence/in-memory-spaces-repository.js";
import { createInMemoryFamilyRepository } from "../../persistence/in-memory-family-repository.js";

const TEST_USER_ID = "test-user";
const WRITE_USER_ID = "write-user";
const READ_USER_ID = "read-user";
const CANDIDATE_USER_ID = "candidate-user";
const TEST_SPACE_ID = "test-space";
const familyPath = `/api/spaces/${TEST_SPACE_ID}/family`;

test("family routes expose and mutate the current family snapshot", async () => {
  const app = createTestApp();

  const initialResponse = await authenticatedRequest(app, familyPath);
  const initialFamily = await initialResponse.json();

  assert.equal(initialResponse.status, 200);
  assert.equal(initialFamily.recurringLines.length, 6);
  assert.deepEqual(initialFamily.distributionLines, []);
  assert.deepEqual(initialFamily.generatedRecurringLineSettings, []);
  assert.deepEqual(initialFamily.loans, []);
  assert.deepEqual(initialFamily.loanRepaymentLines, []);

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

test("family routes update generated recurring line settings", async () => {
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const loanResponse = await authenticatedRequest(app, `${familyPath}/loans`, {
    body: JSON.stringify({
      annualInterestRate: 3.5,
      initialAmount: 1200,
      title: "Saxophone",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const familyWithLoan = await loanResponse.json();
  const loan = familyWithLoan.loans.find(
    (item: { title: string }) => item.title === "Saxophone",
  );

  assert.ok(loan);

  const recurringLineCount = familyWithLoan.recurringLines.length;
  const response = await authenticatedRequest(
    app,
    `${familyPath}/generated-recurring-line-settings`,
    {
      body: JSON.stringify({
        isEnabled: false,
        source: "loans",
        sourceId: loan.id,
      }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  const family = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(family.generatedRecurringLineSettings, [
    {
      isEnabled: false,
      source: "loans",
      sourceId: loan.id,
    },
  ]);
  assert.equal(family.recurringLines.length, recurringLineCount);

  const getResponse = await authenticatedRequest(app, familyPath);
  const persistedFamily = await getResponse.json();

  assert.equal(getResponse.status, 200);
  assert.deepEqual(persistedFamily.generatedRecurringLineSettings, [
    {
      isEnabled: false,
      source: "loans",
      sourceId: loan.id,
    },
  ]);
});

test("family routes reject invalid generated recurring line settings", async () => {
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const emptySourceIdResponse = await authenticatedRequest(
    app,
    `${familyPath}/generated-recurring-line-settings`,
    {
      body: JSON.stringify({
        isEnabled: false,
        source: "loans",
        sourceId: "",
      }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  const emptySourceIdBody = await emptySourceIdResponse.json();

  assert.equal(emptySourceIdResponse.status, 400);
  assert.deepEqual(emptySourceIdBody, {
    message: "Generated recurring line source id is required.",
  });

  const missingSourceResponse = await authenticatedRequest(
    app,
    `${familyPath}/generated-recurring-line-settings`,
    {
      body: JSON.stringify({
        isEnabled: false,
        source: "participations",
        sourceId: "missing-member",
      }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  const missingSourceBody = await missingSourceResponse.json();

  assert.equal(missingSourceResponse.status, 404);
  assert.deepEqual(missingSourceBody, {
    message: "Family member missing-member was not found.",
  });
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

test("family routes manage loans and repayment lines", async () => {
  const app = createTestApp();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  await authenticatedRequest(app, familyPath);

  const loanResponse = await authenticatedRequest(app, `${familyPath}/loans`, {
    body: JSON.stringify({
      annualInterestRate: 3.5,
      initialAmount: 1200,
      title: "Saxophone",
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const familyWithLoan = await loanResponse.json();
  const loan = familyWithLoan.loans.find(
    (item: { title: string }) => item.title === "Saxophone",
  );

  assert.equal(loanResponse.status, 201);
  assert.ok(loan);
  assert.equal(loan.initialAmount, 1200);
  assert.equal(loan.annualInterestRate, 3.5);

  const repaymentResponse = await authenticatedRequest(
    app,
    `${familyPath}/loan-repayment-lines`,
    {
      body: JSON.stringify({
        feesAmount: 3.5,
        loanId: loan.id,
        month,
        paidAmount: 100,
        year,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const familyWithRepayment = await repaymentResponse.json();
  const repaymentLine = familyWithRepayment.loanRepaymentLines.find(
    (item: { loanId: string }) => item.loanId === loan.id,
  );

  assert.equal(repaymentResponse.status, 201);
  assert.ok(repaymentLine);
  assert.equal(repaymentLine.paidAmount, 100);
  assert.equal(repaymentLine.feesAmount, 3.5);

  const updateLoanResponse = await authenticatedRequest(
    app,
    `${familyPath}/loans/${loan.id}`,
    {
      body: JSON.stringify({
        annualInterestRate: 4,
        initialAmount: 1300,
        title: "Saxophone Yamaha",
      }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  const familyWithUpdatedLoan = await updateLoanResponse.json();
  const updatedLoan = familyWithUpdatedLoan.loans.find(
    (item: { id: string }) => item.id === loan.id,
  );

  assert.equal(updateLoanResponse.status, 200);
  assert.equal(updatedLoan?.title, "Saxophone Yamaha");
  assert.equal(updatedLoan?.initialAmount, 1300);
  assert.equal(updatedLoan?.annualInterestRate, 4);

  const updateLineResponse = await authenticatedRequest(
    app,
    `${familyPath}/loan-repayment-lines/${repaymentLine.id}`,
    {
      body: JSON.stringify({
        feesAmount: 4,
        loanId: loan.id,
        month,
        paidAmount: 120,
        year,
      }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  const familyWithUpdatedLine = await updateLineResponse.json();
  const updatedLine = familyWithUpdatedLine.loanRepaymentLines.find(
    (item: { id: string }) => item.id === repaymentLine.id,
  );

  assert.equal(updateLineResponse.status, 200);
  assert.equal(updatedLine?.paidAmount, 120);
  assert.equal(updatedLine?.feesAmount, 4);

  const deleteLineResponse = await authenticatedRequest(
    app,
    `${familyPath}/loan-repayment-lines/${repaymentLine.id}`,
    {
      method: "DELETE",
    },
  );
  const familyWithoutLine = await deleteLineResponse.json();

  assert.equal(deleteLineResponse.status, 200);
  assert.equal(
    familyWithoutLine.loanRepaymentLines.some(
      (item: { id: string }) => item.id === repaymentLine.id,
    ),
    false,
  );

  const secondRepaymentResponse = await authenticatedRequest(
    app,
    `${familyPath}/loan-repayment-lines`,
    {
      body: JSON.stringify({
        feesAmount: 2,
        loanId: loan.id,
        month,
        paidAmount: 80,
        year,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const familyWithSecondLine = await secondRepaymentResponse.json();

  assert.equal(secondRepaymentResponse.status, 201);
  assert.equal(familyWithSecondLine.loanRepaymentLines.length, 1);

  const deleteLoanResponse = await authenticatedRequest(
    app,
    `${familyPath}/loans/${loan.id}`,
    {
      method: "DELETE",
    },
  );
  const familyWithoutLoan = await deleteLoanResponse.json();

  assert.equal(deleteLoanResponse.status, 200);
  assert.equal(familyWithoutLoan.loans.length, 0);
  assert.equal(familyWithoutLoan.loanRepaymentLines.length, 0);
});

test("family routes create members with active flags and defaults", async () => {
  const app = createTestApp();

  const defaultResponse = await authenticatedRequest(
    app,
    `${familyPath}/members`,
    {
      body: JSON.stringify({ name: "Camille" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const defaultFamily = await defaultResponse.json();
  const defaultMember = defaultFamily.members.find(
    (item: { name: string }) => item.name === "Camille",
  );

  assert.equal(defaultResponse.status, 201);
  assert.equal(defaultMember?.isActive, true);

  const response = await authenticatedRequest(app, `${familyPath}/members`, {
    body: JSON.stringify({ isActive: false, name: "Noa" }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const family = await response.json();
  const member = family.members.find(
    (item: { name: string }) => item.name === "Noa",
  );

  assert.equal(response.status, 201);
  assert.equal(member?.isActive, false);
  assert.equal(
    family.categories.some(
      (category: { label: string; ownerId?: string }) =>
        category.label === "Noa" && category.ownerId === member?.id,
    ),
    true,
  );
});

test("family routes update members and linked professional categories", async () => {
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(
    app,
    `${familyPath}/members/lea`,
    {
      body: JSON.stringify({ isActive: false, name: "Lina" }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  const family = await response.json();
  const member = family.members.find(
    (item: { id: string }) => item.id === "lea",
  );
  const category = family.categories.find(
    (item: { id: string }) => item.id === "pro-lea",
  );

  assert.equal(response.status, 200);
  assert.equal(member?.name, "Lina");
  assert.equal(member?.isActive, false);
  assert.equal(category?.label, "Lina");
  assert.equal(category?.ownerId, "lea");
});

test("family routes create participation lines for active members", async () => {
  const app = createTestApp();
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(
    app,
    `${familyPath}/participation-lines`,
    {
      body: JSON.stringify({
        amount: 42.5,
        memberId: "lea",
        month,
        year,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const family = await response.json();
  const line = family.participationLines.find(
    (item: { memberId: string }) => item.memberId === "lea",
  );

  assert.equal(response.status, 201);
  assert.ok(line);
  assert.equal(line.amount, 42.5);
  assert.equal(typeof line.createdAt, "string");
  assert.ok(!Number.isNaN(Date.parse(line.createdAt)));
  assert.equal(line.month, month);
  assert.equal(line.year, year);

  const expenseResponse = await authenticatedRequest(
    app,
    `${familyPath}/participation-lines`,
    {
      body: JSON.stringify({
        amount: -12.75,
        memberId: "lea",
        month,
        year,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const updatedFamily = await expenseResponse.json();
  const expenseLine = updatedFamily.participationLines.find(
    (item: { amount: number }) => item.amount === -12.75,
  );

  assert.equal(expenseResponse.status, 201);
  assert.equal(expenseLine?.amount, -12.75);
});

test("family routes reject participation lines for inactive members", async () => {
  const app = createTestApp();
  const year = new Date().getFullYear();

  const memberResponse = await authenticatedRequest(
    app,
    `${familyPath}/members`,
    {
      body: JSON.stringify({ isActive: false, name: "Noa" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const family = await memberResponse.json();
  const member = family.members.find(
    (item: { name: string }) => item.name === "Noa",
  );

  const response = await authenticatedRequest(
    app,
    `${familyPath}/participation-lines`,
    {
      body: JSON.stringify({
        amount: 20,
        memberId: member.id,
        month: 6,
        year,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    message: "Le membre n'est pas actif.",
  });
});

test("family routes reject invalid participation line periods", async () => {
  const app = createTestApp();
  const year = new Date().getFullYear();

  await authenticatedRequest(app, familyPath);

  const monthResponse = await authenticatedRequest(
    app,
    `${familyPath}/participation-lines`,
    {
      body: JSON.stringify({
        amount: 20,
        memberId: "lea",
        month: 13,
        year,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const monthBody = await monthResponse.json();

  assert.equal(monthResponse.status, 400);
  assert.deepEqual(monthBody, {
    message: "Participation month is invalid.",
  });

  const yearResponse = await authenticatedRequest(
    app,
    `${familyPath}/participation-lines`,
    {
      body: JSON.stringify({
        amount: 20,
        memberId: "lea",
        month: 6,
        year: year + 1,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const yearBody = await yearResponse.json();

  assert.equal(yearResponse.status, 400);
  assert.deepEqual(yearBody, {
    message: "Participation year is invalid.",
  });
});

test("family routes reject participation lines in future months", async () => {
  const app = createTestApp({
    now: () => new Date("2026-05-15T12:00:00.000Z"),
  });

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(
    app,
    `${familyPath}/participation-lines`,
    {
      body: JSON.stringify({
        amount: 20,
        memberId: "lea",
        month: 6,
        year: 2026,
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    message: "Participation month is invalid.",
  });
});

test("family routes reject invalid participation line amounts", async () => {
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(
    app,
    `${familyPath}/participation-lines`,
    {
      body: JSON.stringify({
        amount: 0,
        memberId: "lea",
        month: 6,
        year: new Date().getFullYear(),
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.deepEqual(body, {
    message: "Participation amount must be different from zero.",
  });
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

test("family routes reject duplicate member update names", async () => {
  const app = createTestApp();

  await authenticatedRequest(app, familyPath);

  const response = await authenticatedRequest(
    app,
    `${familyPath}/members/lea`,
    {
      body: JSON.stringify({ isActive: true, name: " marc " }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
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

test("family routes allow read users to view and reject write mutations", async () => {
  const familyRepository = createInMemoryFamilyRepository();
  const app = createTestApp(undefined, familyRepository);

  const getResponse = await authenticatedRequest(
    app,
    familyPath,
    {},
    READ_USER_ID,
  );
  const postResponse = await authenticatedRequest(
    app,
    `${familyPath}/categories`,
    {
      body: JSON.stringify({ label: "Readonly" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
    READ_USER_ID,
  );
  const postBody = await postResponse.json();

  assert.equal(getResponse.status, 200);
  assert.equal(await familyRepository.findBySpaceId(TEST_SPACE_ID), null);
  assert.equal(postResponse.status, 403);
  assert.deepEqual(postBody, { message: "Space is not accessible." });
});

test("family routes allow write users to mutate family data", async () => {
  const app = createTestApp();

  const response = await authenticatedRequest(
    app,
    `${familyPath}/categories`,
    {
      body: JSON.stringify({ label: "Épargne" }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
    WRITE_USER_ID,
  );
  const family = await response.json();

  assert.equal(response.status, 201);
  assert.equal(
    family.categories.some(
      (category: { label: string }) => category.label === "Épargne",
    ),
    true,
  );
});

test("space routes reserve settings and members to owners", async () => {
  const app = createTestApp();

  const membersResponse = await authenticatedRequest(
    app,
    `/api/spaces/${TEST_SPACE_ID}/members`,
    {},
    WRITE_USER_ID,
  );
  const currencyResponse = await authenticatedRequest(
    app,
    `/api/spaces/${TEST_SPACE_ID}/settings/currency`,
    {
      body: JSON.stringify({ currencyCode: "USD" }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
    WRITE_USER_ID,
  );

  assert.equal(membersResponse.status, 403);
  assert.equal(currencyResponse.status, 403);
});

test("space routes let owners search and manage existing users", async () => {
  const app = createTestApp();

  const searchResponse = await authenticatedRequest(
    app,
    `/api/spaces/${TEST_SPACE_ID}/users/search?query=cami`,
  );
  const users = await searchResponse.json();

  assert.equal(searchResponse.status, 200);
  assert.deepEqual(users, [
    {
      email: "camille@example.com",
      id: CANDIDATE_USER_ID,
      name: "Camille",
    },
  ]);

  const addResponse = await authenticatedRequest(
    app,
    `/api/spaces/${TEST_SPACE_ID}/members`,
    {
      body: JSON.stringify({ role: "read", userId: CANDIDATE_USER_ID }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    },
  );
  const addedMember = await addResponse.json();

  assert.equal(addResponse.status, 201);
  assert.equal(addedMember.role, "read");

  const updateResponse = await authenticatedRequest(
    app,
    `/api/spaces/${TEST_SPACE_ID}/members/${CANDIDATE_USER_ID}`,
    {
      body: JSON.stringify({ role: "write" }),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    },
  );
  const updatedMember = await updateResponse.json();

  assert.equal(updateResponse.status, 200);
  assert.equal(updatedMember.role, "write");

  const removeResponse = await authenticatedRequest(
    app,
    `/api/spaces/${TEST_SPACE_ID}/members/${CANDIDATE_USER_ID}`,
    {
      method: "DELETE",
    },
  );

  assert.equal(removeResponse.status, 204);
});

function createTestApp(
  familyServiceOptions?: Parameters<
    typeof createApiApp
  >[0]["familyServiceOptions"],
  familyRepository = createInMemoryFamilyRepository(),
) {
  return createApiApp({
    authProvider: createTestAuthProvider(),
    familyRepository,
    familyServiceOptions,
    spaceRepository: createInMemorySpacesRepository({
      memberships: [
        {
          role: "owner",
          spaceId: TEST_SPACE_ID,
          userId: TEST_USER_ID,
        },
        {
          role: "write",
          spaceId: TEST_SPACE_ID,
          userId: WRITE_USER_ID,
        },
        {
          role: "read",
          spaceId: TEST_SPACE_ID,
          userId: READ_USER_ID,
        },
      ],
      settings: new Map([[TEST_USER_ID, TEST_SPACE_ID]]),
      spaces: [
        {
          id: TEST_SPACE_ID,
          name: "Test space",
        },
      ],
      users: [
        {
          email: "test@test.com",
          id: TEST_USER_ID,
          name: "Test User",
        },
        {
          email: "write@example.com",
          id: WRITE_USER_ID,
          name: "Write User",
        },
        {
          email: "read@example.com",
          id: READ_USER_ID,
          name: "Read User",
        },
        {
          email: "camille@example.com",
          id: CANDIDATE_USER_ID,
          name: "Camille",
        },
      ],
    }),
  });
}

function createTestAuthProvider(): AuthHttpAdapter {
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
    handleAuthRequest: () => new Response(null, { status: 404 }),
  };
}

function authenticatedRequest(
  app: ReturnType<typeof createApiApp>,
  path: string,
  init: RequestInit = {},
  userId = TEST_USER_ID,
) {
  const headers = new Headers(init.headers);
  headers.set("x-user-id", userId);

  return app.request(path, {
    ...init,
    headers,
  });
}
