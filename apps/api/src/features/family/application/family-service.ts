import { randomUUID } from "node:crypto";

import {
  DUPLICATE_FAMILY_CATEGORY_LABEL_MESSAGE,
  DUPLICATE_FAMILY_MEMBER_NAME_MESSAGE,
  DistributionLineNotFoundError,
  FamilyCategoryNotFoundError,
  FamilyMemberNotFoundError,
  InvalidFamilyInputError,
  LINKED_FAMILY_CATEGORY_DELETE_MESSAGE,
  LoanNotFoundError,
  LoanRepaymentLineNotFoundError,
  ParticipationLineNotFoundError,
  RecurringLineNotFoundError,
} from "../domain/family.js";
import type {
  CreateDistributionLineInput,
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateLoanInput,
  CreateLoanRepaymentLineInput,
  CreateParticipationLineInput,
  CreateRecurringLineInput,
  DistributionLine,
  DistributionMemberAmount,
  FamilyCategory,
  FamilyMember,
  FamilySnapshot,
  GeneratedRecurringLineSetting,
  Loan,
  LoanRepaymentLine,
  ParticipationLine,
  RecurringLine,
  UpdateGeneratedRecurringLineSettingInput,
  UpdateLoanInput,
  UpdateLoanRepaymentLineInput,
  UpdateDistributionLineInput,
  UpdateFamilyMemberInput,
  UpdateParticipationLineInput,
  UpdateRecurringLineInput,
} from "../domain/family.js";
import type { FamilyRepository } from "../domain/family-repository.js";
import { createSeedFamily } from "../domain/seed-family.js";

export interface FamilyServiceOptions {
  createId?: (prefix: string, label: string) => string;
  now?: () => Date;
}

interface FamilyRequest {
  spaceId: string;
  userId: string;
}

interface SpaceAccessAuthorizer {
  assertUserCanReadSpace(userId: string, spaceId: string): Promise<void>;
  assertUserCanWriteSpace(userId: string, spaceId: string): Promise<void>;
}

export class FamilyService {
  private readonly createId: (prefix: string, label: string) => string;
  private readonly now: () => Date;

  constructor(
    private readonly repository: FamilyRepository,
    private readonly spaceAccess: SpaceAccessAuthorizer,
    options: FamilyServiceOptions = {},
  ) {
    this.createId = options.createId ?? createDefaultId;
    this.now = options.now ?? (() => new Date());
  }

  async getFamilyForSpace(request: FamilyRequest): Promise<FamilySnapshot> {
    await this.spaceAccess.assertUserCanReadSpace(
      request.userId,
      request.spaceId,
    );

    return this.getOrCreateFamily(request);
  }

  async addMember(
    request: FamilyRequest,
    input: CreateFamilyMemberInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const name = requireText(input.name, "Member name is required.");

    assertUniqueMemberName(family.members, name);
    assertUniqueCategoryLabel(family.categories, name);

    const memberId = this.createUniqueId(
      "member",
      name,
      family.members.map((member) => member.id),
    );
    const member = {
      id: memberId,
      isActive: input.isActive,
      name,
    };
    const categories = [
      ...family.categories,
      {
        id: this.createUniqueId(
          "category",
          name,
          family.categories.map((category) => category.id),
        ),
        kind: "professional" as const,
        label: name,
        ownerId: memberId,
      },
    ];

    return this.repository.saveFamily({
      ...family,
      categories,
      members: [...family.members, member],
    });
  }

  async updateMember(
    request: FamilyRequest,
    memberId: string,
    input: UpdateFamilyMemberInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const existingMember = family.members.find(
      (member) => member.id === memberId,
    );

    if (!existingMember) {
      throw new FamilyMemberNotFoundError(memberId);
    }

    const name = requireText(input.name, "Member name is required.");
    const linkedCategoryIds = family.categories.flatMap((category) =>
      category.ownerId === memberId ? [category.id] : [],
    );

    assertUniqueMemberName(family.members, name, memberId);
    assertUniqueCategoryLabel(family.categories, name, linkedCategoryIds);

    return this.repository.saveFamily({
      ...family,
      categories: family.categories.map((category) =>
        category.kind === "professional" && category.ownerId === memberId
          ? { ...category, label: name }
          : category,
      ),
      members: family.members.map((member) =>
        member.id === memberId
          ? { ...member, isActive: input.isActive, name }
          : member,
      ),
    });
  }

  async addCategory(
    request: FamilyRequest,
    input: CreateFamilyCategoryInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const label = requireText(input.label, "Category label is required.");

    assertUniqueCategoryLabel(family.categories, label);

    return this.repository.saveFamily({
      ...family,
      categories: [
        ...family.categories,
        {
          id: this.createUniqueId(
            "category",
            label,
            family.categories.map((category) => category.id),
          ),
          kind: input.kind ?? "shared",
          label,
          ownerId: input.ownerId,
        },
      ],
    });
  }

  async deleteMember(
    request: FamilyRequest,
    memberId: string,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const hasMember = family.members.some((item) => item.id === memberId);

    if (!hasMember) {
      throw new FamilyMemberNotFoundError(memberId);
    }

    const updatedFamily = await this.repository.deleteMember(
      family.id,
      memberId,
    );

    if (!updatedFamily) {
      throw new FamilyMemberNotFoundError(memberId);
    }

    return updatedFamily;
  }

  async deleteCategory(
    request: FamilyRequest,
    categoryId: string,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const category = family.categories.find((item) => item.id === categoryId);

    if (!category) {
      throw new FamilyCategoryNotFoundError(categoryId);
    }

    if (category.ownerId) {
      throw new InvalidFamilyInputError(LINKED_FAMILY_CATEGORY_DELETE_MESSAGE);
    }

    const updatedFamily = await this.repository.deleteCategory(
      family.id,
      categoryId,
    );

    if (!updatedFamily) {
      throw new FamilyCategoryNotFoundError(categoryId);
    }

    return updatedFamily;
  }

  async createRecurringLine(
    request: FamilyRequest,
    input: CreateRecurringLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const line = normalizeRecurringLine({
      ...input,
      id: this.createUniqueId(
        "line",
        input.title,
        family.recurringLines.map((item) => item.id),
      ),
    });

    return this.repository.createRecurringLine(family.id, line);
  }

  async createParticipationLine(
    request: FamilyRequest,
    input: CreateParticipationLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const createdAt = this.now();
    const participationLine = normalizeParticipationLineInput(
      family,
      input,
      createdAt,
    );

    const line: ParticipationLine = {
      amount: participationLine.amount,
      createdAt: createdAt.toISOString(),
      id: this.createUniqueId(
        "participation",
        `${participationLine.member.name}-${participationLine.year}-${participationLine.month}`,
        family.participationLines.map((item) => item.id),
      ),
      memberId: participationLine.memberId,
      month: participationLine.month,
      year: participationLine.year,
    };

    return this.repository.createParticipationLine(family.id, line);
  }

  async updateParticipationLine(
    request: FamilyRequest,
    lineId: string,
    input: UpdateParticipationLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const existingLine = family.participationLines.find(
      (line) => line.id === lineId,
    );

    if (!existingLine) {
      throw new ParticipationLineNotFoundError(lineId);
    }

    const participationLine = normalizeParticipationLineInput(
      family,
      input,
      this.now(),
    );
    const updatedFamily = await this.repository.updateParticipationLine(
      family.id,
      {
        amount: participationLine.amount,
        createdAt: existingLine.createdAt,
        id: existingLine.id,
        memberId: participationLine.memberId,
        month: participationLine.month,
        year: participationLine.year,
      },
    );

    if (!updatedFamily) {
      throw new ParticipationLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  async deleteParticipationLine(
    request: FamilyRequest,
    lineId: string,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const updatedFamily = await this.repository.deleteParticipationLine(
      family.id,
      lineId,
    );

    if (!updatedFamily) {
      throw new ParticipationLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  async createDistributionLine(
    request: FamilyRequest,
    input: CreateDistributionLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const createdAt = this.now();
    const distributionLine = normalizeDistributionLineInput(
      family,
      input,
      createdAt,
    );

    const line: DistributionLine = {
      amount: distributionLine.amount,
      createdAt: createdAt.toISOString(),
      id: this.createUniqueId(
        "distribution",
        distributionLine.label,
        family.distributionLines.map((item) => item.id),
      ),
      memberAmounts: distributionLine.memberAmounts,
      month: distributionLine.month,
      year: distributionLine.year,
    };

    return this.repository.createDistributionLine(family.id, line);
  }

  async updateDistributionLine(
    request: FamilyRequest,
    lineId: string,
    input: UpdateDistributionLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const existingLine = family.distributionLines.find(
      (line) => line.id === lineId,
    );

    if (!existingLine) {
      throw new DistributionLineNotFoundError(lineId);
    }

    const distributionLine = normalizeDistributionLineInput(
      family,
      input,
      this.now(),
    );
    const updatedFamily = await this.repository.updateDistributionLine(
      family.id,
      {
        amount: distributionLine.amount,
        createdAt: existingLine.createdAt,
        id: existingLine.id,
        memberAmounts: distributionLine.memberAmounts,
        month: distributionLine.month,
        year: distributionLine.year,
      },
    );

    if (!updatedFamily) {
      throw new DistributionLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  async deleteDistributionLine(
    request: FamilyRequest,
    lineId: string,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const updatedFamily = await this.repository.deleteDistributionLine(
      family.id,
      lineId,
    );

    if (!updatedFamily) {
      throw new DistributionLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  async createLoan(
    request: FamilyRequest,
    input: CreateLoanInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const createdAt = this.now();
    const loan = normalizeLoanInput({
      ...input,
      createdAt: createdAt.toISOString(),
      id: this.createUniqueId(
        "loan",
        input.title,
        family.loans.map((item) => item.id),
      ),
    });

    return this.repository.createLoan(family.id, loan);
  }

  async updateLoan(
    request: FamilyRequest,
    loanId: string,
    input: UpdateLoanInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const existingLoan = family.loans.find((loan) => loan.id === loanId);

    if (!existingLoan) {
      throw new LoanNotFoundError(loanId);
    }

    const updatedFamily = await this.repository.updateLoan(
      family.id,
      normalizeLoanInput({
        ...input,
        createdAt: existingLoan.createdAt,
        id: existingLoan.id,
      }),
    );

    if (!updatedFamily) {
      throw new LoanNotFoundError(loanId);
    }

    return updatedFamily;
  }

  async deleteLoan(
    request: FamilyRequest,
    loanId: string,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const updatedFamily = await this.repository.deleteLoan(family.id, loanId);

    if (!updatedFamily) {
      throw new LoanNotFoundError(loanId);
    }

    return updatedFamily;
  }

  async createLoanRepaymentLine(
    request: FamilyRequest,
    input: CreateLoanRepaymentLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const createdAt = this.now();
    const repaymentLine = normalizeLoanRepaymentLineInput(
      family,
      {
        ...input,
        createdAt: createdAt.toISOString(),
        id: this.createUniqueId(
          "loan-repayment",
          `${input.loanId}-${input.year}-${input.month}`,
          family.loanRepaymentLines.map((item) => item.id),
        ),
      },
      createdAt,
    );

    return this.repository.createLoanRepaymentLine(family.id, repaymentLine);
  }

  async updateLoanRepaymentLine(
    request: FamilyRequest,
    lineId: string,
    input: UpdateLoanRepaymentLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const existingLine = family.loanRepaymentLines.find(
      (line) => line.id === lineId,
    );

    if (!existingLine) {
      throw new LoanRepaymentLineNotFoundError(lineId);
    }

    const updatedFamily = await this.repository.updateLoanRepaymentLine(
      family.id,
      normalizeLoanRepaymentLineInput(
        family,
        {
          ...input,
          createdAt: existingLine.createdAt,
          id: existingLine.id,
        },
        this.now(),
      ),
    );

    if (!updatedFamily) {
      throw new LoanRepaymentLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  async deleteLoanRepaymentLine(
    request: FamilyRequest,
    lineId: string,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const updatedFamily = await this.repository.deleteLoanRepaymentLine(
      family.id,
      lineId,
    );

    if (!updatedFamily) {
      throw new LoanRepaymentLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  async updateRecurringLine(
    request: FamilyRequest,
    lineId: string,
    input: UpdateRecurringLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const line = normalizeRecurringLine({ ...input, id: lineId });
    const updatedFamily = await this.repository.updateRecurringLine(
      family.id,
      line,
    );

    if (!updatedFamily) {
      throw new RecurringLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  async updateGeneratedRecurringLineSetting(
    request: FamilyRequest,
    input: UpdateGeneratedRecurringLineSettingInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const setting = normalizeGeneratedRecurringLineSetting(family, input);

    return this.repository.updateGeneratedRecurringLineSetting(
      family.id,
      setting,
    );
  }

  async deleteRecurringLine(
    request: FamilyRequest,
    lineId: string,
  ): Promise<FamilySnapshot> {
    const family = await this.getWritableFamily(request);
    const updatedFamily = await this.repository.deleteRecurringLine(
      family.id,
      lineId,
    );

    if (!updatedFamily) {
      throw new RecurringLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  private async getOrCreateFamily(
    request: FamilyRequest,
  ): Promise<FamilySnapshot> {
    const existingFamily = await this.repository.findBySpaceId(request.spaceId);

    if (existingFamily) {
      return existingFamily;
    }

    return this.repository.createFamily(
      request.spaceId,
      createSeedFamily(createFamilyId(request.spaceId)),
    );
  }

  private async getWritableFamily(
    request: FamilyRequest,
  ): Promise<FamilySnapshot> {
    await this.spaceAccess.assertUserCanWriteSpace(
      request.userId,
      request.spaceId,
    );

    return this.getOrCreateFamily(request);
  }

  private createUniqueId(
    prefix: string,
    label: string,
    existingIds: string[],
  ): string {
    const baseId = this.createId(prefix, label);
    const takenIds = new Set(existingIds);

    if (!takenIds.has(baseId)) {
      return baseId;
    }

    let suffix = 2;

    while (takenIds.has(`${baseId}-${suffix}`)) {
      suffix += 1;
    }

    return `${baseId}-${suffix}`;
  }
}

function assertUniqueCategoryLabel(
  categories: FamilyCategory[],
  label: string,
  ignoredCategoryIds: string[] = [],
) {
  const normalizedLabel = normalizeCategoryLabel(label);
  const ignoredCategoryIdSet = new Set(ignoredCategoryIds);
  const hasDuplicate = categories.some(
    (category) =>
      !ignoredCategoryIdSet.has(category.id) &&
      normalizeCategoryLabel(category.label) === normalizedLabel,
  );

  if (hasDuplicate) {
    throw new InvalidFamilyInputError(DUPLICATE_FAMILY_CATEGORY_LABEL_MESSAGE);
  }
}

function assertUniqueMemberName(
  members: FamilyMember[],
  name: string,
  ignoredMemberId?: string,
) {
  const normalizedName = normalizeMemberName(name);
  const hasDuplicate = members.some(
    (member) =>
      member.id !== ignoredMemberId &&
      normalizeMemberName(member.name) === normalizedName,
  );

  if (hasDuplicate) {
    throw new InvalidFamilyInputError(DUPLICATE_FAMILY_MEMBER_NAME_MESSAGE);
  }
}

function normalizeCategoryLabel(label: string): string {
  return label.trim().toLocaleLowerCase("fr-FR");
}

function normalizeMemberName(name: string): string {
  return name.trim().toLocaleLowerCase("fr-FR");
}

interface NormalizedParticipationLineInput {
  amount: number;
  member: FamilyMember;
  memberId: string;
  month: number;
  year: number;
}

function normalizeParticipationLineInput(
  family: FamilySnapshot,
  input: CreateParticipationLineInput | UpdateParticipationLineInput,
  currentDate: Date,
): NormalizedParticipationLineInput {
  const memberId = requireText(
    input.memberId,
    "Participation member is required.",
  );
  const member = family.members.find((item) => item.id === memberId);

  if (!member) {
    throw new FamilyMemberNotFoundError(memberId);
  }

  if (!member.isActive) {
    throw new InvalidFamilyInputError("Le membre n'est pas actif.");
  }

  const amount = requireNonZeroNumber(
    input.amount,
    "Participation amount must be different from zero.",
  );
  const year = requireInteger(input.year, "Participation year is invalid.");
  const month = requireInteger(input.month, "Participation month is invalid.");
  assertCurrentOrPastYearMonth({
    currentDate,
    month,
    monthMessage: "Participation month is invalid.",
    year,
    yearMessage: "Participation year is invalid.",
  });

  return {
    amount,
    member,
    memberId,
    month,
    year,
  };
}

interface NormalizedDistributionLineInput {
  amount: number;
  label: string;
  memberAmounts: DistributionMemberAmount[];
  month: number;
  year: number;
}

function normalizeDistributionLineInput(
  family: FamilySnapshot,
  input: CreateDistributionLineInput | UpdateDistributionLineInput,
  currentDate: Date,
): NormalizedDistributionLineInput {
  const amount = requirePositiveNumber(
    input.amount,
    "Distribution amount is required.",
  );
  const year = requireInteger(input.year, "Distribution year is invalid.");
  const month = requireInteger(input.month, "Distribution month is invalid.");

  assertCurrentOrPastYearMonth({
    currentDate,
    month,
    monthMessage: "Distribution month is invalid.",
    year,
    yearMessage: "Distribution year is invalid.",
  });

  if (input.memberAmounts.length === 0) {
    throw new InvalidFamilyInputError("Distribution members are required.");
  }

  const memberIds = new Set<string>();
  const memberAmounts = input.memberAmounts.map((item) => {
    const memberId = requireText(
      item.memberId,
      "Distribution member is required.",
    );

    if (memberIds.has(memberId)) {
      throw new InvalidFamilyInputError("Distribution member is duplicated.");
    }

    memberIds.add(memberId);

    const member = family.members.find((familyMember) => {
      return familyMember.id === memberId;
    });

    if (!member) {
      throw new FamilyMemberNotFoundError(memberId);
    }

    if (!member.isActive) {
      throw new InvalidFamilyInputError("Distribution member is inactive.");
    }

    return {
      amount: requireNonNegativeNumber(
        item.amount,
        "Distribution member amount is invalid.",
      ),
      memberId,
    };
  });
  const memberNames = memberAmounts
    .map((memberAmount) => {
      return family.members.find(
        (member) => member.id === memberAmount.memberId,
      )?.name;
    })
    .filter((name): name is string => Boolean(name));

  return {
    amount,
    label: `${memberNames.join("-")}-${year}-${month}`,
    memberAmounts,
    month,
    year,
  };
}

function normalizeRecurringLine(line: RecurringLine): RecurringLine {
  const title = requireText(line.title, "Recurring line title is required.");
  const categoryId = requireText(
    line.categoryId,
    "Recurring line category is required.",
  );
  const description = line.description.trim();
  const recurrenceMonths = requirePositiveNumber(
    line.recurrenceMonths,
    "Recurring line recurrence must be positive.",
  );

  if (line.movement !== "positive" && line.movement !== "negative") {
    throw new InvalidFamilyInputError("Recurring line movement is invalid.");
  }

  if (line.isEstimate) {
    const minAmount = requirePositiveNumber(
      line.minAmount,
      "Minimum amount is required.",
    );
    const maxAmount = requirePositiveNumber(
      line.maxAmount,
      "Maximum amount is required.",
    );
    const normalizedMinAmount = Math.min(minAmount, maxAmount);
    const normalizedMaxAmount = Math.max(minAmount, maxAmount);

    return {
      ...line,
      amount: (normalizedMinAmount + normalizedMaxAmount) / 2,
      categoryId,
      description,
      maxAmount: normalizedMaxAmount,
      minAmount: normalizedMinAmount,
      recurrenceMonths,
      title,
    };
  }

  const amount = requirePositiveNumber(
    line.amount,
    "Recurring line amount must be positive.",
  );

  return {
    ...line,
    amount,
    categoryId,
    description,
    maxAmount: undefined,
    minAmount: undefined,
    recurrenceMonths,
    title,
  };
}

function normalizeGeneratedRecurringLineSetting(
  family: FamilySnapshot,
  input: UpdateGeneratedRecurringLineSettingInput,
): GeneratedRecurringLineSetting {
  const sourceId = requireText(
    input.sourceId,
    "Generated recurring line source id is required.",
  );

  if (typeof input.isEnabled !== "boolean") {
    throw new InvalidFamilyInputError(
      "Generated recurring line enabled state is invalid.",
    );
  }

  if (input.source === "loans") {
    const loan = family.loans.find((item) => item.id === sourceId);

    if (!loan) {
      throw new LoanNotFoundError(sourceId);
    }

    return {
      isEnabled: input.isEnabled,
      source: input.source,
      sourceId,
    };
  }

  if (input.source === "participations" || input.source === "distribution") {
    const member = family.members.find((item) => item.id === sourceId);

    if (!member) {
      throw new FamilyMemberNotFoundError(sourceId);
    }

    return {
      isEnabled: input.isEnabled,
      source: input.source,
      sourceId,
    };
  }

  throw new InvalidFamilyInputError(
    "Generated recurring line source is invalid.",
  );
}

function normalizeLoanInput(loan: Loan): Loan {
  return {
    ...loan,
    annualInterestRate: requireNonNegativeNumber(
      loan.annualInterestRate,
      "Loan interest rate is invalid.",
    ),
    initialAmount: requirePositiveNumber(
      loan.initialAmount,
      "Loan initial amount is required.",
    ),
    title: requireText(loan.title, "Loan title is required."),
  };
}

function normalizeLoanRepaymentLineInput(
  family: FamilySnapshot,
  line: LoanRepaymentLine,
  currentDate: Date,
): LoanRepaymentLine {
  const loanId = requireText(line.loanId, "Loan is required.");
  const loan = family.loans.find((item) => item.id === loanId);

  if (!loan) {
    throw new LoanNotFoundError(loanId);
  }

  const paidAmount = requirePositiveNumber(
    line.paidAmount,
    "Loan paid amount is required.",
  );
  const feesAmount = requireNonNegativeNumber(
    line.feesAmount,
    "Loan fees amount is invalid.",
  );
  const year = requireInteger(line.year, "Loan repayment year is invalid.");
  const month = requireInteger(line.month, "Loan repayment month is invalid.");
  assertCurrentOrPastYearMonth({
    currentDate,
    month,
    monthMessage: "Loan repayment month is invalid.",
    year,
    yearMessage: "Loan repayment year is invalid.",
  });

  if (feesAmount > paidAmount) {
    throw new InvalidFamilyInputError(
      "Loan fees cannot exceed the paid amount.",
    );
  }

  return {
    ...line,
    feesAmount,
    loanId,
    month,
    paidAmount,
    year,
  };
}

function assertCurrentOrPastYearMonth({
  currentDate,
  month,
  monthMessage,
  year,
  yearMessage,
}: {
  currentDate: Date;
  month: number;
  monthMessage: string;
  year: number;
  yearMessage: string;
}) {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (year > currentYear) {
    throw new InvalidFamilyInputError(yearMessage);
  }

  if (
    month < 1 ||
    month > 12 ||
    (year === currentYear && month > currentMonth)
  ) {
    throw new InvalidFamilyInputError(monthMessage);
  }
}

function createDefaultId(prefix: string, label: string): string {
  const slug = createSlug(label);
  const suffix = randomUUID().slice(0, 8);

  return `${prefix}-${slug || "item"}-${suffix}`;
}

function createFamilyId(spaceId: string): string {
  const slug = createSlug(spaceId);

  return `family-${slug || "space"}`;
}

function createSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function requireText(value: string, message: string): string {
  const text = value.trim();

  if (!text) {
    throw new InvalidFamilyInputError(message);
  }

  return text;
}

function requireFiniteNumber(
  value: number | undefined,
  message: string,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new InvalidFamilyInputError(message);
  }

  return value;
}

function requirePositiveNumber(
  value: number | undefined,
  message: string,
): number {
  const number = requireFiniteNumber(value, message);

  if (number <= 0) {
    throw new InvalidFamilyInputError(message);
  }

  return number;
}

function requireNonNegativeNumber(
  value: number | undefined,
  message: string,
): number {
  const number = requireFiniteNumber(value, message);

  if (number < 0) {
    throw new InvalidFamilyInputError(message);
  }

  return number;
}

function requireNonZeroNumber(
  value: number | undefined,
  message: string,
): number {
  const number = requireFiniteNumber(value, message);

  if (number === 0) {
    throw new InvalidFamilyInputError(message);
  }

  return number;
}

function requireInteger(value: number | undefined, message: string): number {
  const number = requireFiniteNumber(value, message);

  if (!Number.isInteger(number)) {
    throw new InvalidFamilyInputError(message);
  }

  return number;
}
