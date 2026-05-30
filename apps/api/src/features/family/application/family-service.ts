import { randomUUID } from "node:crypto";

import {
  DEV_USER_ID,
  DUPLICATE_FAMILY_CATEGORY_LABEL_MESSAGE,
  DUPLICATE_FAMILY_MEMBER_NAME_MESSAGE,
  FamilyCategoryNotFoundError,
  FamilyMemberNotFoundError,
  InvalidFamilyInputError,
  LINKED_FAMILY_CATEGORY_DELETE_MESSAGE,
  RecurringLineNotFoundError,
} from "../domain/family.js";
import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  FamilyCategory,
  FamilyMember,
  FamilySnapshot,
  RecurringLine,
  UpdateRecurringLineInput,
} from "../domain/family.js";
import type { FamilyRepository } from "../domain/family-repository.js";
import { createSeedFamily } from "../domain/seed-family.js";

interface FamilyServiceOptions {
  createId?: (prefix: string, label: string) => string;
  currentUserId?: string;
}

export class FamilyService {
  private readonly createId: (prefix: string, label: string) => string;
  private readonly currentUserId: string;

  constructor(
    private readonly repository: FamilyRepository,
    options: FamilyServiceOptions = {},
  ) {
    this.createId = options.createId ?? createDefaultId;
    this.currentUserId = options.currentUserId ?? DEV_USER_ID;
  }

  async getFamilyForCurrentUser(): Promise<FamilySnapshot> {
    return this.getOrCreateFamily();
  }

  async addMember(input: CreateFamilyMemberInput): Promise<FamilySnapshot> {
    const family = await this.getOrCreateFamily();
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
      name,
      role: "",
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

  async addCategory(input: CreateFamilyCategoryInput): Promise<FamilySnapshot> {
    const family = await this.getOrCreateFamily();
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

  async deleteMember(memberId: string): Promise<FamilySnapshot> {
    const family = await this.getOrCreateFamily();
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

  async deleteCategory(categoryId: string): Promise<FamilySnapshot> {
    const family = await this.getOrCreateFamily();
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
    input: CreateRecurringLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getOrCreateFamily();
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

  async updateRecurringLine(
    lineId: string,
    input: UpdateRecurringLineInput,
  ): Promise<FamilySnapshot> {
    const family = await this.getOrCreateFamily();
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

  async deleteRecurringLine(lineId: string): Promise<FamilySnapshot> {
    const family = await this.getOrCreateFamily();
    const updatedFamily = await this.repository.deleteRecurringLine(
      family.id,
      lineId,
    );

    if (!updatedFamily) {
      throw new RecurringLineNotFoundError(lineId);
    }

    return updatedFamily;
  }

  private async getOrCreateFamily(): Promise<FamilySnapshot> {
    const existingFamily = await this.repository.findByUserId(
      this.currentUserId,
    );

    if (existingFamily) {
      return existingFamily;
    }

    return this.repository.createFamily(createSeedFamily(this.currentUserId));
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
) {
  const normalizedLabel = normalizeCategoryLabel(label);
  const hasDuplicate = categories.some(
    (category) => normalizeCategoryLabel(category.label) === normalizedLabel,
  );

  if (hasDuplicate) {
    throw new InvalidFamilyInputError(DUPLICATE_FAMILY_CATEGORY_LABEL_MESSAGE);
  }
}

function assertUniqueMemberName(members: FamilyMember[], name: string) {
  const normalizedName = normalizeMemberName(name);
  const hasDuplicate = members.some(
    (member) => normalizeMemberName(member.name) === normalizedName,
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

function createDefaultId(prefix: string, label: string): string {
  const slug = createSlug(label);
  const suffix = randomUUID().slice(0, 8);

  return `${prefix}-${slug || "item"}-${suffix}`;
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
