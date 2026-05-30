import { useState } from "react";
import Box from "@mui/material/Box";
import { ConfirmationDialog } from "@repo/ui/confirmation-dialog";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import { PageShell } from "@repo/ui/page-shell";

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
  FamilyCategory,
  FamilyMember,
  RecurringLine,
  UpdateRecurringLineInput,
} from "../domain/family";
import { FamilyBudgetTable } from "./family-budget-table";
import { FamilyCategoryModal } from "./family-category-modal";
import { FamilyMemberModal } from "./family-member-modal";
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
  onDeleteCategory: (categoryId: string) => Promise<void> | void;
  onDeleteMember: (memberId: string) => Promise<void> | void;
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
  onDeleteCategory,
  onDeleteMember,
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
  const [linePendingDeletion, setLinePendingDeletion] =
    useState<RecurringLine | null>(null);
  const [sidebarItemPendingDeletion, setSidebarItemPendingDeletion] =
    useState<SidebarDeletionTarget | null>(null);
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

  function handleRequestDeleteLine(line: RecurringLine) {
    setLinePendingDeletion(line);
  }

  function handleRequestDeleteMember(member: FamilyMember) {
    setSidebarItemPendingDeletion({ item: member, type: "member" });
  }

  function handleRequestDeleteCategory(category: FamilyCategory) {
    setSidebarItemPendingDeletion({ item: category, type: "category" });
  }

  async function handleConfirmDeleteLine() {
    if (!linePendingDeletion) {
      return;
    }

    try {
      await onDeleteRecurringLine(linePendingDeletion.id);
      setLinePendingDeletion(null);
    } catch {
      return;
    }
  }

  async function handleConfirmDeleteSidebarItem() {
    if (!sidebarItemPendingDeletion) {
      return;
    }

    try {
      if (sidebarItemPendingDeletion.type === "member") {
        await onDeleteMember(sidebarItemPendingDeletion.item.id);
      } else {
        await onDeleteCategory(sidebarItemPendingDeletion.item.id);
      }

      setSidebarItemPendingDeletion(null);
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
    <PageShell
      subtitle="Dépenses, revenus et récurrences du foyer"
      title="Foyer"
    >
      <FeedbackSnackbar
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
          onDeleteLine={handleRequestDeleteLine}
          onEditLine={handleEditLine}
          onViewLine={handleViewLine}
        />
        <FamilySidebar
          categories={family.categories}
          disabled={isSaving}
          members={family.members}
          onAddCategory={() => setIsCategoryModalOpen(true)}
          onAddMember={() => setIsMemberModalOpen(true)}
          onDeleteCategory={handleRequestDeleteCategory}
          onDeleteMember={handleRequestDeleteMember}
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
      <ConfirmationDialog
        confirmColor="error"
        confirmFirst
        confirmLabel="Supprimer"
        description={getDeleteSidebarItemDescription(
          family,
          sidebarItemPendingDeletion,
        )}
        isPending={isSaving}
        onCancel={() => setSidebarItemPendingDeletion(null)}
        onConfirm={handleConfirmDeleteSidebarItem}
        open={sidebarItemPendingDeletion !== null}
        title={getDeleteSidebarItemTitle(sidebarItemPendingDeletion)}
      />
      <ConfirmationDialog
        confirmColor="error"
        confirmFirst
        confirmLabel="Supprimer"
        description={getDeleteLineDescription(linePendingDeletion)}
        isPending={isSaving}
        onCancel={() => setLinePendingDeletion(null)}
        onConfirm={handleConfirmDeleteLine}
        open={linePendingDeletion !== null}
        title="Supprimer cette ligne ?"
      />
    </PageShell>
  );
}

type SidebarDeletionTarget =
  | { item: FamilyMember; type: "member" }
  | { item: FamilyCategory; type: "category" };

function getCategoryLabel(family: Family, line: RecurringLine | null): string {
  if (!line) {
    return "";
  }

  return (
    family.categories.find((category) => category.id === line.categoryId)
      ?.label ?? line.categoryId
  );
}

function getDeleteLineDescription(line: RecurringLine | null): string {
  if (!line) {
    return "";
  }

  return `La ligne "${line.title}" sera supprimée définitivement.`;
}

function getDeleteSidebarItemTitle(
  target: SidebarDeletionTarget | null,
): string {
  if (target?.type === "member") {
    return "Supprimer ce membre ?";
  }

  return "Supprimer cette catégorie ?";
}

function getDeleteSidebarItemDescription(
  family: Family,
  target: SidebarDeletionTarget | null,
): string {
  if (!target) {
    return "";
  }

  const linkedLineCount = getDeletedSidebarItemLineCount(family, target);

  if (target.type === "member") {
    if (linkedLineCount > 0) {
      return `Le membre "${target.item.name}", sa catégorie professionnelle et ${formatLinkedLineCount(linkedLineCount)} seront supprimés définitivement.`;
    }

    return `Le membre "${target.item.name}" et sa catégorie professionnelle seront supprimés définitivement.`;
  }

  if (linkedLineCount > 0) {
    return `La catégorie "${target.item.label}" et ${formatLinkedLineCount(linkedLineCount)} seront supprimées définitivement.`;
  }

  return `La catégorie "${target.item.label}" sera supprimée définitivement.`;
}

function getDeletedSidebarItemLineCount(
  family: Family,
  target: SidebarDeletionTarget,
): number {
  if (target.type === "category") {
    return family.recurringLines.filter(
      (line) => line.categoryId === target.item.id,
    ).length;
  }

  const linkedCategoryIds = new Set(
    family.categories
      .filter((category) => category.ownerId === target.item.id)
      .map((category) => category.id),
  );

  return family.recurringLines.filter((line) =>
    linkedCategoryIds.has(line.categoryId),
  ).length;
}

function formatLinkedLineCount(count: number): string {
  if (count === 1) {
    return "1 ligne récurrente liée";
  }

  return `${count} lignes récurrentes liées`;
}
