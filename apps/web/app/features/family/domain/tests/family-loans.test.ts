import assert from "node:assert/strict";
import test from "node:test";

import type { Family } from "../family";
import { getFamilyLoanProjection } from "../family-loans";

test("family loan projection excludes flagged repayment lines from summary but keeps them in month groups", () => {
  const projection = getFamilyLoanProjection(createFamily(), {
    currentMonthIndex: 4,
    currentYear: 2026,
    year: 2026,
  });
  const februaryGroup = projection.monthGroups.find(
    (group) => group.id === "2026-02",
  );

  assert.equal(projection.summary.paidAmount, 100);
  assert.equal(projection.summary.feesAmount, 10);
  assert.equal(projection.summary.repaymentAmount, 90);
  assert.equal(projection.summary.remainingAmount, 910);
  assert.ok(februaryGroup);
  assert.deepEqual(
    februaryGroup.lines.map((line) => line.line.id),
    ["excluded-repayment"],
  );
  assert.equal(februaryGroup.paidAmount, 200);
});

function createFamily(): Family {
  return {
    categories: [],
    distributionLines: [],
    generatedRecurringLineSettings: [],
    id: "family",
    loanRepaymentLines: [
      {
        createdAt: "2026-01-01T10:00:00.000Z",
        feesAmount: 10,
        id: "repayment",
        isExcludedFromStats: false,
        loanId: "loan",
        month: 1,
        paidAmount: 100,
        year: 2026,
      },
      {
        createdAt: "2026-02-01T10:00:00.000Z",
        feesAmount: 0,
        id: "excluded-repayment",
        isExcludedFromStats: true,
        loanId: "loan",
        month: 2,
        paidAmount: 200,
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
    members: [],
    participationLines: [],
    recurringLines: [],
  };
}
