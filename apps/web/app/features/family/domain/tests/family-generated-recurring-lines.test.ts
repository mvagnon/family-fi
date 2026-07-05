import assert from "node:assert/strict";
import test from "node:test";

import type { Family } from "../family";
import { getGeneratedRecurringLines } from "../family-generated-recurring-lines";

test("generated recurring lines turn a negative distribution average into an income line", () => {
  const family = createFamily({
    distributionLines: [
      {
        amount: 0,
        createdAt: "2026-01-01T10:00:00.000Z",
        id: "reimbursement",
        isExcludedFromStats: false,
        memberAmounts: [{ amount: -100, memberId: "ana" }],
        month: 1,
        year: 2026,
      },
    ],
  });

  const lines = getGeneratedRecurringLines(family);

  assert.equal(lines.length, 1);
  assert.equal(lines[0]?.line.amount, 100);
  assert.equal(lines[0]?.line.movement, "positive");
  assert.equal(lines[0]?.source, "distribution");
});

test("generated recurring lines skip zero distribution averages", () => {
  const family = createFamily({
    distributionLines: [
      {
        amount: 0,
        createdAt: "2026-01-01T10:00:00.000Z",
        id: "zero",
        isExcludedFromStats: false,
        memberAmounts: [{ amount: 0, memberId: "ana" }],
        month: 1,
        year: 2026,
      },
    ],
  });

  assert.deepEqual(getGeneratedRecurringLines(family), []);
});

test("generated recurring lines ignore lines excluded from statistics", () => {
  const family = createFamily({
    distributionLines: [
      {
        amount: 50,
        createdAt: "2026-01-01T10:00:00.000Z",
        id: "distribution-included",
        isExcludedFromStats: false,
        memberAmounts: [{ amount: 50, memberId: "ana" }],
        month: 1,
        year: 2026,
      },
      {
        amount: 950,
        createdAt: "2026-02-01T10:00:00.000Z",
        id: "distribution-excluded",
        isExcludedFromStats: true,
        memberAmounts: [{ amount: 950, memberId: "ana" }],
        month: 2,
        year: 2026,
      },
    ],
    loanRepaymentLines: [
      {
        createdAt: "2026-01-01T10:00:00.000Z",
        feesAmount: 0,
        id: "repayment-included",
        isExcludedFromStats: false,
        loanId: "loan",
        month: 1,
        paidAmount: 100,
        year: 2026,
      },
      {
        createdAt: "2026-02-01T10:00:00.000Z",
        feesAmount: 0,
        id: "repayment-excluded",
        isExcludedFromStats: true,
        loanId: "loan",
        month: 2,
        paidAmount: 500,
        year: 2026,
      },
    ],
    loans: [
      {
        annualInterestRate: 0,
        createdAt: "2026-01-01T10:00:00.000Z",
        id: "loan",
        initialAmount: 1000,
        title: "Loan",
      },
    ],
    participationLines: [
      {
        amount: 100,
        createdAt: "2026-01-01T10:00:00.000Z",
        id: "participation-included",
        isExcludedFromStats: false,
        memberId: "ana",
        month: 1,
        year: 2026,
      },
      {
        amount: 900,
        createdAt: "2026-02-01T10:00:00.000Z",
        id: "participation-excluded",
        isExcludedFromStats: true,
        memberId: "ana",
        month: 2,
        year: 2026,
      },
    ],
  });

  const amountsBySource = new Map(
    getGeneratedRecurringLines(family).map((line) => [
      line.source,
      line.line.amount,
    ]),
  );

  assert.equal(amountsBySource.get("loans"), 100);
  assert.equal(amountsBySource.get("participations"), 100);
  assert.equal(amountsBySource.get("distribution"), 50);
});

function createFamily(overrides: Partial<Family>): Family {
  return {
    categories: [],
    distributionLines: [],
    generatedRecurringLineSettings: [],
    id: "family",
    loanRepaymentLines: [],
    loans: [],
    members: [{ id: "ana", isActive: true, name: "Ana" }],
    participationLines: [],
    recurringLines: [],
    ...overrides,
  };
}
