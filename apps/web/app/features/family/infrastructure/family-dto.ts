import type {
  DistributionLine,
  DistributionMemberAmount,
  Family,
  FamilyCategory,
  FamilyMember,
  GeneratedRecurringLineSetting,
  GeneratedRecurringLineSource,
  Loan,
  LoanRepaymentLine,
  Movement,
  ParticipationLine,
  RecurringLine,
} from "../domain/family";

const invalidFamilyMessage = "La réponse famille est invalide.";

export class FamilyApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyApiError";
  }
}

export function parseFamilyResponse(value: unknown): Family {
  const family = getRecord(value);

  return {
    categories: getArray(family, "categories").map(parseCategory),
    distributionLines: getOptionalArray(family, "distributionLines").map(
      parseDistributionLine,
    ),
    generatedRecurringLineSettings: getOptionalArray(
      family,
      "generatedRecurringLineSettings",
    ).map(parseGeneratedRecurringLineSetting),
    id: getString(family, "id"),
    loanRepaymentLines: getOptionalArray(family, "loanRepaymentLines").map(
      parseLoanRepaymentLine,
    ),
    loans: getOptionalArray(family, "loans").map(parseLoan),
    members: getArray(family, "members").map(parseMember),
    participationLines: getOptionalArray(family, "participationLines").map(
      parseParticipationLine,
    ),
    recurringLines: getArray(family, "recurringLines").map(parseRecurringLine),
  };
}

function parseGeneratedRecurringLineSetting(
  value: unknown,
): GeneratedRecurringLineSetting {
  const setting = getRecord(value);

  return {
    isEnabled: getBoolean(setting, "isEnabled"),
    source: getGeneratedRecurringLineSource(setting),
    sourceId: getString(setting, "sourceId"),
  };
}

function parseLoan(value: unknown): Loan {
  const loan = getRecord(value);

  return {
    annualInterestRate: getNonNegativeNumber(loan, "annualInterestRate"),
    createdAt: getDateString(loan, "createdAt"),
    id: getString(loan, "id"),
    initialAmount: getPositiveNumber(loan, "initialAmount"),
    title: getString(loan, "title"),
  };
}

function parseLoanRepaymentLine(value: unknown): LoanRepaymentLine {
  const line = getRecord(value);

  return {
    createdAt: getDateString(line, "createdAt"),
    feesAmount: getNonNegativeNumber(line, "feesAmount"),
    id: getString(line, "id"),
    isExcludedFromStats:
      getOptionalBoolean(line, "isExcludedFromStats") ?? false,
    loanId: getString(line, "loanId"),
    month: getMonth(line),
    paidAmount: getPositiveNumber(line, "paidAmount"),
    year: getPositiveInteger(line, "year"),
  };
}

function parseMember(value: unknown): FamilyMember {
  const member = getRecord(value);

  return {
    id: getString(member, "id"),
    isActive: getOptionalBoolean(member, "isActive") ?? true,
    name: getString(member, "name"),
  };
}

function parseCategory(value: unknown): FamilyCategory {
  const category = getRecord(value);

  return {
    id: getString(category, "id"),
    kind: getCategoryKind(category),
    label: getString(category, "label"),
    ownerId: getOptionalString(category, "ownerId"),
  };
}

function parseRecurringLine(value: unknown): RecurringLine {
  const line = getRecord(value);

  return {
    amount: getFiniteNumber(line, "amount"),
    categoryId: getString(line, "categoryId"),
    description: getString(line, "description"),
    id: getString(line, "id"),
    isEstimate: getBoolean(line, "isEstimate"),
    maxAmount: getOptionalFiniteNumber(line, "maxAmount"),
    minAmount: getOptionalFiniteNumber(line, "minAmount"),
    movement: getMovement(line),
    recurrenceMonths: getPositiveNumber(line, "recurrenceMonths"),
    title: getString(line, "title"),
  };
}

function parseParticipationLine(value: unknown): ParticipationLine {
  const line = getRecord(value);

  return {
    amount: getNonZeroNumber(line, "amount"),
    createdAt: getDateString(line, "createdAt"),
    id: getString(line, "id"),
    isExcludedFromStats:
      getOptionalBoolean(line, "isExcludedFromStats") ?? false,
    memberId: getString(line, "memberId"),
    month: getMonth(line),
    title: getOptionalString(line, "title"),
    year: getPositiveInteger(line, "year"),
  };
}

function parseDistributionLine(value: unknown): DistributionLine {
  const line = getRecord(value);

  return {
    amount: getNonNegativeNumber(line, "amount"),
    createdAt: getDateString(line, "createdAt"),
    id: getString(line, "id"),
    isExcludedFromStats:
      getOptionalBoolean(line, "isExcludedFromStats") ?? false,
    memberAmounts: getArray(line, "memberAmounts").map(
      parseDistributionMemberAmount,
    ),
    month: getMonth(line),
    year: getPositiveInteger(line, "year"),
  };
}

function parseDistributionMemberAmount(
  value: unknown,
): DistributionMemberAmount {
  const memberAmount = getRecord(value);

  return {
    amount: getFiniteNumber(memberAmount, "amount"),
    memberId: getString(memberAmount, "memberId"),
  };
}

function getCategoryKind(
  value: Record<string, unknown>,
): FamilyCategory["kind"] {
  const kind = getString(value, "kind");

  if (kind === "shared" || kind === "professional") {
    return kind;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getMovement(value: Record<string, unknown>): Movement {
  const movement = getString(value, "movement");

  if (movement === "positive" || movement === "negative") {
    return movement;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getGeneratedRecurringLineSource(
  value: Record<string, unknown>,
): GeneratedRecurringLineSource {
  const source = getString(value, "source");

  if (
    source === "loans" ||
    source === "participations" ||
    source === "distribution"
  ) {
    return source;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getRecord(value: unknown): Record<string, unknown> {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getArray(value: Record<string, unknown>, key: string): unknown[] {
  const item = value[key];

  if (Array.isArray(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getOptionalArray(
  value: Record<string, unknown>,
  key: string,
): unknown[] {
  const item = value[key];

  if (item === undefined || item === null) {
    return [];
  }

  if (Array.isArray(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getString(value: Record<string, unknown>, key: string): string {
  const item = value[key];

  if (typeof item === "string") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getDateString(value: Record<string, unknown>, key: string): string {
  const item = getString(value, key);

  if (!Number.isNaN(Date.parse(item))) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getOptionalString(
  value: Record<string, unknown>,
  key: string,
): string | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item === "string") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function parseStringItem(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getBoolean(value: Record<string, unknown>, key: string): boolean {
  const item = value[key];

  if (typeof item === "boolean") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getOptionalBoolean(
  value: Record<string, unknown>,
  key: string,
): boolean | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item === "boolean") {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getFiniteNumber(value: Record<string, unknown>, key: string): number {
  const item = value[key];

  if (typeof item === "number" && Number.isFinite(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getOptionalFiniteNumber(
  value: Record<string, unknown>,
  key: string,
): number | undefined {
  const item = value[key];

  if (item === undefined || item === null) {
    return undefined;
  }

  if (typeof item === "number" && Number.isFinite(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getPositiveNumber(
  value: Record<string, unknown>,
  key: string,
): number {
  const item = getFiniteNumber(value, key);

  if (item > 0) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getNonNegativeNumber(
  value: Record<string, unknown>,
  key: string,
): number {
  const item = getFiniteNumber(value, key);

  if (item >= 0) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getPositiveInteger(
  value: Record<string, unknown>,
  key: string,
): number {
  const item = getPositiveNumber(value, key);

  if (Number.isInteger(item)) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getNonZeroNumber(value: Record<string, unknown>, key: string): number {
  const item = getFiniteNumber(value, key);

  if (item !== 0) {
    return item;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}

function getMonth(value: Record<string, unknown>): number {
  const month = getPositiveInteger(value, "month");

  if (month >= 1 && month <= 12) {
    return month;
  }

  throw new FamilyApiError(invalidFamilyMessage);
}
