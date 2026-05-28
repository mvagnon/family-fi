import { useState } from "react";
import Box from "@mui/material/Box";

import {
  getDuplicateFamilyCategoryLabelMessage,
  getDuplicateFamilyMemberNameMessage,
} from "../application/family-local-commands";
import {
  createDraftRecurringLine,
  toCreateRecurringLineInput,
  toUpdateRecurringLineInput,
} from "../application/family-line-commands";
import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family,
  UpdateRecurringLineInput,
  RecurringLine,
} from "../domain/family";
import { FamilyBudgetTable } from "./family-budget-table";
import { FamilyCategoryModal } from "./family-category-modal";
import { FamilyErrorSnackbar } from "./family-error-snackbar";
import { FamilyMemberModal } from "./family-member-modal";
import { FamilyPageShell } from "./family-page-shell";
import { FamilySidebar } from "./family-sidebar";
import { FamilySummaryStrip } from "./family-summary-strip";
import { LineEditDialog } from "./line-edit-dialog";
import { LineSummaryDialog } from "./line-summary-dialog";

interface FamilyDashboardProps {
  family: Family;
  isSaving?: boolean;
  mutationError?: string;
  onAddCategory: (input: CreateFamilyCategoryInput) => Promise<void> | void;
  onAddMember: (input: CreateFamilyMemberInput) => Promise<void> | void;
  onCreateRecurringLine: (
    input: CreateRecurringLineInput,
  ) => Promise<void> | void;
  onDeleteRecurringLine: (lineId: string) => Promise<void> | void;
  onUpdateRecurringLine: (
    lineId: string,
    input: UpdateRecurringLineInput,
  ) => Promise<void> | void;
}

export function FamilyDashboard({
  family,
  isSaving = false,
  mutationError,
  onAddCategory,
  onAddMember,
  onCreateRecurringLine,
  onDeleteRecurringLine,
  onUpdateRecurringLine,
}: FamilyDashboardProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [localError, setLocalError] = useState<{
    message: string;
    revision: number;
  } | null>(null);
  const [lineDialogMode, setLineDialogMode] = useState<"create" | "edit">(
    "edit",
  );
  const [summaryLine, setSummaryLine] = useState<RecurringLine | null>(null);
  const [selectedLine, setSelectedLine] = useState<RecurringLine | null>(null);

  function handleAddLine() {
    setLineDialogMode("create");
    setSelectedLine(createDraftRecurringLine(family, `new-line-${Date.now()}`));
  }

  function handleEditLine(line: RecurringLine) {
    setLineDialogMode("edit");
    setSelectedLine(line);
  }

  function handleViewLine(line: RecurringLine) {
    setSummaryLine(line);
  }

  async function handleSaveCategory(input: CreateFamilyCategoryInput) {
    const duplicateMessage = getDuplicateFamilyCategoryLabelMessage(
      family.categories,
      input.label,
    );

    if (duplicateMessage) {
      showLocalError(duplicateMessage);
      return;
    }

    try {
      await onAddCategory(input);
      setLocalError(null);
      setIsCategoryModalOpen(false);
    } catch {
      return;
    }
  }

  async function handleSaveMember(input: CreateFamilyMemberInput) {
    const duplicateMessage =
      getDuplicateFamilyMemberNameMessage(family.members, input.name) ??
      getDuplicateFamilyCategoryLabelMessage(family.categories, input.name);

    if (duplicateMessage) {
      showLocalError(duplicateMessage);
      return;
    }

    try {
      await onAddMember(input);
      setLocalError(null);
      setIsMemberModalOpen(false);
    } catch {
      return;
    }
  }

  async function handleSaveLine(line: RecurringLine) {
    try {
      if (lineDialogMode === "create") {
        await onCreateRecurringLine(toCreateRecurringLineInput(line));
      } else {
        await onUpdateRecurringLine(line.id, toUpdateRecurringLineInput(line));
      }

      setSelectedLine(null);
    } catch {
      return;
    }
  }

  async function handleDeleteLine(line: RecurringLine) {
    try {
      await onDeleteRecurringLine(line.id);
    } catch {
      return;
    }
  }

  function showLocalError(message: string) {
    setLocalError((currentError) => ({
      message,
      revision: (currentError?.revision ?? 0) + 1,
    }));
  }

  return (
    <FamilyPageShell>
      <FamilyErrorSnackbar
        key={localError ? `local-${localError.revision}` : mutationError}
        message={localError?.message ?? mutationError}
      />

      <FamilySummaryStrip lines={family.recurringLines} />

      <Box
        sx={{
          alignItems: "start",
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: {
            lg: "minmax(0, 1fr) 320px",
            xs: "minmax(0, 1fr)",
          },
        }}
      >
        <FamilyBudgetTable
          categories={family.categories}
          disabled={isSaving}
          lines={family.recurringLines}
          onAddLine={handleAddLine}
          onDeleteLine={handleDeleteLine}
          onEditLine={handleEditLine}
          onViewLine={handleViewLine}
        />
        <FamilySidebar
          categories={family.categories}
          disabled={isSaving}
          members={family.members}
          onAddCategory={() => setIsCategoryModalOpen(true)}
          onAddMember={() => setIsMemberModalOpen(true)}
        />
      </Box>

      <FamilyCategoryModal
        isSaving={isSaving}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        open={isCategoryModalOpen}
      />
      <FamilyMemberModal
        isSaving={isSaving}
        onClose={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
        open={isMemberModalOpen}
      />
      <LineEditDialog
        categories={family.categories}
        isSaving={isSaving}
        line={selectedLine}
        mode={lineDialogMode}
        onClose={() => setSelectedLine(null)}
        onSave={handleSaveLine}
        open={selectedLine !== null}
      />
      <LineSummaryDialog
        categoryLabel={getCategoryLabel(family, summaryLine)}
        line={summaryLine}
        onClose={() => setSummaryLine(null)}
        open={summaryLine !== null}
      />
    </FamilyPageShell>
  );
}

function getCategoryLabel(family: Family, line: RecurringLine | null): string {
  if (!line) {
    return "";
  }

  return (
    family.categories.find((category) => category.id === line.categoryId)
      ?.label ?? line.categoryId
  );
}
