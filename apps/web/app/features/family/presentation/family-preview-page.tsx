import { useState } from "react";

import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  FamilyCategory,
  FamilyMember,
  UpdateRecurringLineInput,
} from "../domain/family";
import { createPreviewFamily } from "../domain/preview-family";
import { FamilyDashboard } from "./family-dashboard";

export function FamilyPreviewPage() {
  const [family, setFamily] = useState(createPreviewFamily);

  function handleAddCategory(input: CreateFamilyCategoryInput) {
    setFamily((currentFamily) => ({
      ...currentFamily,
      categories: [...currentFamily.categories, createCategory(input.label)],
    }));
  }

  function handleAddMember(input: CreateFamilyMemberInput) {
    setFamily((currentFamily) => {
      const member = createMember(input);
      const category = input.categoryLabel
        ? createCategory(input.categoryLabel, member.id)
        : null;

      return {
        ...currentFamily,
        categories: category
          ? [...currentFamily.categories, category]
          : currentFamily.categories,
        members: [...currentFamily.members, member],
      };
    });
  }

  function handleCreateRecurringLine(input: CreateRecurringLineInput) {
    setFamily((currentFamily) => ({
      ...currentFamily,
      recurringLines: [
        ...currentFamily.recurringLines,
        { ...input, id: `line-${Date.now()}` },
      ],
    }));
  }

  function handleUpdateRecurringLine(
    lineId: string,
    input: UpdateRecurringLineInput,
  ) {
    setFamily((currentFamily) => ({
      ...currentFamily,
      recurringLines: currentFamily.recurringLines.map((line) =>
        line.id === lineId ? { ...input, id: lineId } : line,
      ),
    }));
  }

  return (
    <FamilyDashboard
      family={family}
      onAddCategory={handleAddCategory}
      onAddMember={handleAddMember}
      onCreateRecurringLine={handleCreateRecurringLine}
      onUpdateRecurringLine={handleUpdateRecurringLine}
    />
  );
}

function createMember(input: CreateFamilyMemberInput): FamilyMember {
  return {
    id: createEntityId("member", input.name),
    name: input.name,
    role: input.role,
  };
}

function createCategory(label: string, ownerId?: string): FamilyCategory {
  return {
    id: createEntityId("category", label),
    kind: ownerId ? "professional" : "shared",
    label,
    ownerId,
  };
}

function createEntityId(prefix: string, label: string): string {
  const normalizedLabel = label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${prefix}-${normalizedLabel || "item"}-${Date.now()}`;
}
