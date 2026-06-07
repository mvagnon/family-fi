import type { Family, Loan, LoanRepaymentLine } from "./family";

const monthIndexes = Array.from({ length: 12 }, (_, index) => index);

export interface FamilyLoanRepaymentLine {
  feesAmount: number;
  line: LoanRepaymentLine;
  loan: Loan;
  remainingAfter: number;
  repaymentAmount: number;
}

export interface FamilyLoanMonthGroup {
  feesAmount: number;
  id: string;
  lines: FamilyLoanRepaymentLine[];
  monthIndex: number;
  paidAmount: number;
  remainingAmount: number;
  repaymentAmount: number;
  year: number;
}

export interface FamilyLoanBalance {
  loan: Loan;
  remainingAmount: number;
}

export interface FamilyLoanSummary {
  feesAmount: number;
  loanCount: number;
  paidAmount: number;
  projectionDate: Date | null;
  remainingAmount: number;
  repaymentAmount: number;
}

export interface FamilyLoanProjection {
  activeLoans: FamilyLoanBalance[];
  monthGroups: FamilyLoanMonthGroup[];
  pastLoans: FamilyLoanBalance[];
  summary: FamilyLoanSummary;
}

export interface FamilyLoanProjectionInput {
  currentMonthIndex: number;
  currentYear: number;
  year: number;
}

interface LoanPeriodInput {
  ignoredLineId?: string;
  loanId: string;
  month: number;
  year: number;
}

export function getFamilyLoanProjection(
  family: Family,
  input: FamilyLoanProjectionInput,
): FamilyLoanProjection {
  const balances = family.loans.map((loan) => ({
    loan,
    remainingAmount: getLoanRemainingAmount(family, loan.id),
  }));
  const activeLoans = balances.filter((balance) => balance.remainingAmount > 0);
  const pastLoans = balances.filter((balance) => balance.remainingAmount <= 0);
  const visibleLoanIds = new Set(
    balances
      .filter((balance) => !balance.loan.isHidden)
      .map((balance) => balance.loan.id),
  );
  const lines = getVisibleLoanRepaymentLines(family, visibleLoanIds, input);

  return {
    activeLoans,
    monthGroups: buildMonthGroups(family, lines, activeLoans, input),
    pastLoans,
    summary: getLoanSummary(family, visibleLoanIds, input),
  };
}

export function getLoanRemainingAmount(
  family: Family,
  loanId: string,
  ignoredLineId?: string,
): number {
  const loan = family.loans.find((item) => item.id === loanId);

  if (!loan) {
    return 0;
  }

  const repaymentAmount = family.loanRepaymentLines
    .filter((line) => line.loanId === loanId && line.id !== ignoredLineId)
    .reduce((total, line) => total + getLineRepaymentAmount(line), 0);

  return roundCurrency(loan.initialAmount - repaymentAmount);
}

export function getLoanRemainingBeforeLine(
  family: Family,
  input: LoanPeriodInput,
): number {
  const loan = family.loans.find((item) => item.id === input.loanId);

  if (!loan) {
    return 0;
  }

  const repaymentAmount = family.loanRepaymentLines
    .filter(
      (line) =>
        line.loanId === input.loanId &&
        line.id !== input.ignoredLineId &&
        isLineBeforeOrInPeriod(line, input),
    )
    .reduce((total, line) => total + getLineRepaymentAmount(line), 0);

  return roundCurrency(loan.initialAmount - repaymentAmount);
}

export function getSuggestedLoanFees(
  family: Family,
  input: LoanPeriodInput,
): number {
  const loan = family.loans.find((item) => item.id === input.loanId);

  if (!loan) {
    return 0;
  }

  const remainingAmount = Math.max(
    getLoanRemainingBeforeLine(family, input),
    0,
  );

  return roundCurrency((remainingAmount * loan.annualInterestRate) / 100 / 12);
}

export function getLineRepaymentAmount(line: LoanRepaymentLine): number {
  return roundCurrency(line.paidAmount - line.feesAmount);
}

function getVisibleLoanRepaymentLines(
  family: Family,
  visibleLoanIds: ReadonlySet<string>,
  input: FamilyLoanProjectionInput,
): FamilyLoanRepaymentLine[] {
  return family.loanRepaymentLines.flatMap((line) => {
    const loan = family.loans.find((item) => item.id === line.loanId);

    if (
      !loan ||
      !visibleLoanIds.has(loan.id) ||
      line.year !== input.year ||
      !isVisibleLoanMonth(line, input)
    ) {
      return [];
    }

    return [
      {
        feesAmount: line.feesAmount,
        line,
        loan,
        remainingAfter: getRemainingAfterLine(family, line),
        repaymentAmount: getLineRepaymentAmount(line),
      },
    ];
  });
}

function buildMonthGroups(
  family: Family,
  lines: FamilyLoanRepaymentLine[],
  activeLoans: FamilyLoanBalance[],
  input: FamilyLoanProjectionInput,
): FamilyLoanMonthGroup[] {
  return getVisibleMonthIndexes(input).map((monthIndex) => {
    const month = monthIndex + 1;
    const monthLines = lines.filter((line) => line.line.month === month);
    const monthId = `${input.year}-${String(month).padStart(2, "0")}`;

    return {
      feesAmount: monthLines.reduce(
        (total, line) => total + line.feesAmount,
        0,
      ),
      id: monthId,
      lines: monthLines,
      monthIndex,
      paidAmount: monthLines.reduce(
        (total, line) => total + line.line.paidAmount,
        0,
      ),
      remainingAmount: activeLoans
        .filter((balance) => !balance.loan.isHidden)
        .reduce(
          (total, balance) =>
            total +
            getLoanRemainingAtMonthEnd(family, balance.loan, input.year, month),
          0,
        ),
      repaymentAmount: monthLines.reduce(
        (total, line) => total + line.repaymentAmount,
        0,
      ),
      year: input.year,
    };
  });
}

function getLoanSummary(
  family: Family,
  visibleLoanIds: ReadonlySet<string>,
  input: FamilyLoanProjectionInput,
): FamilyLoanSummary {
  const visibleLines = family.loanRepaymentLines.filter(
    (line) =>
      visibleLoanIds.has(line.loanId) &&
      line.year === input.year &&
      isVisibleLoanMonth(line, input),
  );
  const remainingAmount = family.loans
    .filter((loan) => visibleLoanIds.has(loan.id))
    .reduce(
      (total, loan) =>
        total + Math.max(getLoanRemainingAmount(family, loan.id), 0),
      0,
    );

  return {
    feesAmount: roundCurrency(
      visibleLines.reduce((total, line) => total + line.feesAmount, 0),
    ),
    loanCount: visibleLoanIds.size,
    paidAmount: roundCurrency(
      visibleLines.reduce((total, line) => total + line.paidAmount, 0),
    ),
    projectionDate: getProjectionDate(family, visibleLoanIds, input),
    remainingAmount: roundCurrency(remainingAmount),
    repaymentAmount: roundCurrency(
      visibleLines.reduce(
        (total, line) => total + getLineRepaymentAmount(line),
        0,
      ),
    ),
  };
}

function getProjectionDate(
  family: Family,
  visibleLoanIds: ReadonlySet<string>,
  input: FamilyLoanProjectionInput,
): Date | null {
  const remainingAmount = family.loans
    .filter((loan) => visibleLoanIds.has(loan.id))
    .reduce(
      (total, loan) =>
        total + Math.max(getLoanRemainingAmount(family, loan.id), 0),
      0,
    );

  if (remainingAmount <= 0) {
    return new Date(input.currentYear, input.currentMonthIndex, 1);
  }

  const monthlyRepayment = getAverageMonthlyRepayment(family, visibleLoanIds);

  if (monthlyRepayment <= 0) {
    return null;
  }

  return new Date(
    input.currentYear,
    input.currentMonthIndex + Math.ceil(remainingAmount / monthlyRepayment),
    1,
  );
}

function getAverageMonthlyRepayment(
  family: Family,
  visibleLoanIds: ReadonlySet<string>,
): number {
  const repaymentsByMonth = new Map<string, number>();

  for (const line of family.loanRepaymentLines) {
    if (!visibleLoanIds.has(line.loanId)) {
      continue;
    }

    const key = `${line.year}-${String(line.month).padStart(2, "0")}`;
    repaymentsByMonth.set(
      key,
      (repaymentsByMonth.get(key) ?? 0) + getLineRepaymentAmount(line),
    );
  }

  const repayments = [...repaymentsByMonth.values()].filter(
    (value) => value > 0,
  );

  if (repayments.length === 0) {
    return 0;
  }

  return (
    repayments.reduce((total, value) => total + value, 0) / repayments.length
  );
}

function getRemainingAfterLine(
  family: Family,
  targetLine: LoanRepaymentLine,
): number {
  const loan = family.loans.find((item) => item.id === targetLine.loanId);

  if (!loan) {
    return 0;
  }

  const repaymentAmount = family.loanRepaymentLines
    .filter(
      (line) =>
        line.loanId === targetLine.loanId &&
        compareLoanRepaymentLines(line, targetLine) <= 0,
    )
    .reduce((total, line) => total + getLineRepaymentAmount(line), 0);

  return roundCurrency(loan.initialAmount - repaymentAmount);
}

function getLoanRemainingAtMonthEnd(
  family: Family,
  loan: Loan,
  year: number,
  month: number,
): number {
  const repaymentAmount = family.loanRepaymentLines
    .filter(
      (line) =>
        line.loanId === loan.id &&
        (line.year < year || (line.year === year && line.month <= month)),
    )
    .reduce((total, line) => total + getLineRepaymentAmount(line), 0);

  return roundCurrency(loan.initialAmount - repaymentAmount);
}

function isVisibleLoanMonth(
  line: LoanRepaymentLine,
  input: FamilyLoanProjectionInput,
): boolean {
  if (line.year < input.currentYear) {
    return true;
  }

  if (line.year === input.currentYear) {
    return line.month <= input.currentMonthIndex + 1;
  }

  return false;
}

function getVisibleMonthIndexes(input: FamilyLoanProjectionInput): number[] {
  if (input.year > input.currentYear) {
    return [];
  }

  if (input.year === input.currentYear) {
    return monthIndexes.filter(
      (monthIndex) => monthIndex <= input.currentMonthIndex,
    );
  }

  return monthIndexes;
}

function isLineBeforeOrInPeriod(
  line: LoanRepaymentLine,
  input: LoanPeriodInput,
): boolean {
  return (
    line.year < input.year ||
    (line.year === input.year && line.month <= input.month)
  );
}

function compareLoanRepaymentLines(
  left: LoanRepaymentLine,
  right: LoanRepaymentLine,
): number {
  return (
    left.year - right.year ||
    left.month - right.month ||
    Date.parse(left.createdAt) - Date.parse(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
