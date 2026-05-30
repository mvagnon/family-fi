import { useState } from "react";

import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  UpdateRecurringLineInput,
} from "../domain/family";
import {
  addLocalFamilyCategory,
  addLocalFamilyMember,
  createLocalRecurringLine,
  createSluggedFamilyEntityId,
  deleteLocalFamilyCategory,
  deleteLocalFamilyMember,
  deleteLocalRecurringLine,
  updateLocalRecurringLine,
} from "../application/family-local-commands";
import { createPreviewFamily } from "../domain/preview-family";
import { FamilyDashboard } from "./family-dashboard";

export function FamilyPreviewPage() {
  const [family, setFamily] = useState(createPreviewFamily);

  function handleAddCategory(input: CreateFamilyCategoryInput) {
    setFamily((currentFamily) =>
      addLocalFamilyCategory(currentFamily, input, createPreviewEntityId),
    );
  }

  function handleAddMember(input: CreateFamilyMemberInput) {
    setFamily((currentFamily) =>
      addLocalFamilyMember(currentFamily, input, createPreviewEntityId),
    );
  }

  function handleCreateRecurringLine(input: CreateRecurringLineInput) {
    setFamily((currentFamily) =>
      createLocalRecurringLine(
        currentFamily,
        input,
        createPreviewEntityId("line", input.title),
      ),
    );
  }

  function handleUpdateRecurringLine(
    lineId: string,
    input: UpdateRecurringLineInput,
  ) {
    setFamily((currentFamily) =>
      updateLocalRecurringLine(currentFamily, lineId, input),
    );
  }

  function handleDeleteRecurringLine(lineId: string) {
    setFamily((currentFamily) =>
      deleteLocalRecurringLine(currentFamily, lineId),
    );
  }

  function handleDeleteMember(memberId: string) {
    setFamily((currentFamily) =>
      deleteLocalFamilyMember(currentFamily, memberId),
    );
  }

  function handleDeleteCategory(categoryId: string) {
    setFamily((currentFamily) =>
      deleteLocalFamilyCategory(currentFamily, categoryId),
    );
  }

  return (
    <FamilyDashboard
      family={family}
      onAddCategory={handleAddCategory}
      onAddMember={handleAddMember}
      onCreateRecurringLine={handleCreateRecurringLine}
      onDeleteCategory={handleDeleteCategory}
      onDeleteMember={handleDeleteMember}
      onDeleteRecurringLine={handleDeleteRecurringLine}
      onUpdateRecurringLine={handleUpdateRecurringLine}
    />
  );
}

function createPreviewEntityId(prefix: string, label: string): string {
  return createSluggedFamilyEntityId(prefix, label, String(Date.now()));
}
