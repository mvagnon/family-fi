import assert from "node:assert/strict";
import test from "node:test";

import type { Family } from "../family";
import {
  getFamilyParticipationProjection,
  resolveParticipationLineMember,
} from "../family-participations";

test("family participation projection summarizes visible current-year lines", () => {
  const projection = getFamilyParticipationProjection(createFamily(), {
    currentMonthIndex: 4,
    currentYear: 2026,
    year: 2026,
  });

  assert.deepEqual(projection.summary, {
    difference: 60,
    expenses: 40,
    income: 100,
  });
  assert.deepEqual(
    projection.activeMembers.map((member) => member.id),
    ["lea"],
  );
  assert.equal(projection.monthGroups.length, 5);
  assert.equal(
    projection.monthGroups.some((group) =>
      group.lines.some((item) => item.line.id === "future-line"),
    ),
    false,
  );
});

test("family participation projection groups active members and inactive members with month lines", () => {
  const projection = getFamilyParticipationProjection(createFamily(), {
    currentMonthIndex: 4,
    currentYear: 2026,
    year: 2026,
  });
  const aprilGroup = projection.monthGroups.find(
    (group) => group.id === "2026-04",
  );
  const mayGroup = projection.monthGroups.find(
    (group) => group.id === "2026-05",
  );

  assert.ok(aprilGroup);
  assert.deepEqual(
    aprilGroup.memberGroups.map((group) => ({
      lineIds: group.lines.map((item) => item.line.id),
      memberId: group.member.id,
      total: group.total,
    })),
    [
      { lineIds: [], memberId: "lea", total: 0 },
      { lineIds: ["marc-expense"], memberId: "marc", total: -10 },
    ],
  );
  assert.ok(mayGroup);
  assert.deepEqual(
    mayGroup.memberGroups.map((group) => group.member.id),
    ["lea"],
  );
  assert.equal(mayGroup.total, 70);
  assert.deepEqual(
    mayGroup.memberGroups.map((group) => ({
      lineIds: group.lines.map((item) => item.line.id),
      memberId: group.member.id,
      total: group.total,
    })),
    [{ lineIds: ["lea-income", "lea-expense"], memberId: "lea", total: 70 }],
  );
});

test("family participation projection excludes hidden members before totals", () => {
  const projection = getFamilyParticipationProjection(createFamily(), {
    currentMonthIndex: 4,
    currentYear: 2026,
    visibleMemberIds: new Set(["lea"]),
    year: 2026,
  });
  const mayGroup = projection.monthGroups.find(
    (group) => group.id === "2026-05",
  );

  assert.deepEqual(projection.summary, {
    difference: 70,
    expenses: 30,
    income: 100,
  });
  assert.ok(mayGroup);
  assert.deepEqual(
    mayGroup.memberGroups.map((group) => group.member.id),
    ["lea"],
  );
  assert.equal(
    projection.monthGroups.some((group) =>
      group.lines.some((item) => item.line.id === "marc-expense"),
    ),
    false,
  );
});

test("family participation projection shows all months for past years", () => {
  const projection = getFamilyParticipationProjection(createFamily(), {
    currentMonthIndex: 4,
    currentYear: 2026,
    year: 2025,
  });
  const decemberGroup = projection.monthGroups.find(
    (group) => group.id === "2025-12",
  );

  assert.equal(projection.monthGroups.length, 12);
  assert.deepEqual(projection.summary, {
    difference: 70,
    expenses: 0,
    income: 70,
  });
  assert.ok(decemberGroup);
  assert.deepEqual(
    decemberGroup.lines.map((item) => item.line.id),
    ["past-line"],
  );
});

test("family participation member resolution distinguishes active states", () => {
  const family = createFamily();

  assert.deepEqual(resolveParticipationLineMember(family, "lea"), {
    member: family.members[0],
    status: "available",
  });
  assert.deepEqual(resolveParticipationLineMember(family, "marc"), {
    status: "inactive-member",
  });
  assert.deepEqual(resolveParticipationLineMember(family, "missing"), {
    status: "missing-member",
  });
});

function createFamily(): Family {
  return {
    categories: [],
    distributionLines: [],
    id: "family",
    loanRepaymentLines: [],
    loans: [],
    members: [
      { id: "lea", isActive: true, name: "Lea" },
      { id: "marc", isActive: false, name: "Marc" },
    ],
    participationLines: [
      {
        amount: 100,
        createdAt: "2026-05-01T10:00:00.000Z",
        id: "lea-income",
        memberId: "lea",
        month: 5,
        year: 2026,
      },
      {
        amount: -30,
        createdAt: "2026-05-02T10:00:00.000Z",
        id: "lea-expense",
        memberId: "lea",
        month: 5,
        year: 2026,
      },
      {
        amount: -10,
        createdAt: "2026-04-01T10:00:00.000Z",
        id: "marc-expense",
        memberId: "marc",
        month: 4,
        year: 2026,
      },
      {
        amount: 999,
        createdAt: "2026-06-01T10:00:00.000Z",
        id: "future-line",
        memberId: "lea",
        month: 6,
        year: 2026,
      },
      {
        amount: 50,
        createdAt: "2026-05-03T10:00:00.000Z",
        id: "missing-member-line",
        memberId: "missing",
        month: 5,
        year: 2026,
      },
      {
        amount: 70,
        createdAt: "2025-12-01T10:00:00.000Z",
        id: "past-line",
        memberId: "lea",
        month: 12,
        year: 2025,
      },
    ],
    recurringLines: [],
  };
}
