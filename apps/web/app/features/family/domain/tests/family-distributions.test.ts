import assert from "node:assert/strict";
import test from "node:test";

import type { Family } from "../family";
import { getFamilyDistributionProjection } from "../family-distributions";

test("family distribution projection handles negative member amounts", () => {
  const projection = getFamilyDistributionProjection(createFamily(), {
    currentMonthIndex: 4,
    currentYear: 2026,
    year: 2026,
  });
  const aprilGroup = projection.monthGroups.find(
    (group) => group.id === "2026-04",
  );
  const reimbursementLine = aprilGroup?.lines.find(
    (line) => line.line.id === "reimbursement",
  );

  assert.ok(reimbursementLine);
  assert.equal(reimbursementLine.baseAmount, 0);
  assert.equal(reimbursementLine.receivedAmount, -200);
  assert.equal(reimbursementLine.balanceDelta, 200);
  assert.deepEqual(
    projection.memberBalances.map((item) => ({
      balance: item.balance,
      memberId: item.member.id,
    })),
    [
      { balance: 0, memberId: "ana" },
      { balance: 200, memberId: "ben" },
    ],
  );
});

test("family distribution projection excludes flagged lines from summary but keeps them in month groups and balances", () => {
  const projection = getFamilyDistributionProjection(createFamily(), {
    currentMonthIndex: 4,
    currentYear: 2026,
    year: 2026,
  });
  const aprilGroup = projection.monthGroups.find(
    (group) => group.id === "2026-04",
  );

  assert.deepEqual(projection.summary, {
    averageSalary: 360,
    maxSalary: 2000,
    minSalary: -200,
  });
  assert.ok(aprilGroup);
  assert.deepEqual(
    aprilGroup.lines.map((line) => line.line.id),
    ["reimbursement", "excluded"],
  );
  assert.equal(aprilGroup.receivedAmount, 300);
  assert.equal(
    projection.memberBalances.find((item) => item.member.id === "ben")?.balance,
    200,
  );
});

function createFamily(): Family {
  return {
    categories: [],
    distributionLines: [
      {
        amount: 1000,
        createdAt: "2026-03-01T10:00:00.000Z",
        id: "salary",
        isExcludedFromStats: false,
        memberAmounts: [
          { amount: 1200, memberId: "ana" },
          { amount: 800, memberId: "ben" },
        ],
        month: 3,
        year: 2026,
      },
      {
        amount: 0,
        createdAt: "2026-04-01T10:00:00.000Z",
        id: "reimbursement",
        isExcludedFromStats: false,
        memberAmounts: [{ amount: -200, memberId: "ana" }],
        month: 4,
        year: 2026,
      },
      {
        amount: 500,
        createdAt: "2026-04-02T10:00:00.000Z",
        id: "excluded",
        isExcludedFromStats: true,
        memberAmounts: [{ amount: 500, memberId: "ben" }],
        month: 4,
        year: 2026,
      },
    ],
    generatedRecurringLineSettings: [],
    id: "family",
    loanRepaymentLines: [],
    loans: [],
    members: [
      { id: "ana", isActive: true, name: "Ana" },
      { id: "ben", isActive: true, name: "Ben" },
    ],
    participationLines: [],
    recurringLines: [],
  };
}
