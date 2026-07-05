import { useState } from "react";
import { ConfirmationDialog } from "@repo/ui/confirmation-dialog";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import {
  AppShellContent,
  AppShellTop,
  AppShellWidgets,
} from "../../app-shell/presentation/app-shell-layout";
import {
  getDuplicateFamilyCategoryLabelError,
  getDuplicateFamilyMemberNameError,
  getFamilyMemberLinkedCategoryIds,
  type FamilyLocalValidationError,
} from "../application/family-local-commands";
import {
  createDraftRecurringLine,
  toCreateRecurringLineInput,
  toUpdateRecurringLineInput,
} from "../application/family-line-commands";
import {
  toManualFamilyBudgetLines,
  type FamilyBudgetLine,
} from "../domain/family-budget";
import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family,
  FamilyCategory,
  FamilyMember,
  RecurringLine,
  UpdateGeneratedRecurringLineSettingInput,
  UpdateFamilyMemberInput,
  UpdateRecurringLineInput,
} from "../domain/family";
import {
  getGeneratedRecurringLines,
  type GeneratedFamilyBudgetLine,
} from "../domain/family-generated-recurring-lines";
import { FamilyBudgetTable } from "./family-budget-table";
import { FamilyCategoryModal } from "./family-category-modal";
import { FamilyMemberModal } from "./family-member-modal";
import { useFamilyMemberVisibility } from "./family-member-visibility-provider";
import { FamilySidebar } from "./family-sidebar";
import { FamilySummaryStrip } from "./family-summary-strip";
import { LineEditDialog } from "./line-edit-dialog";
import { LineSummaryDialog } from "./line-summary-dialog";

interface FamilyDashboardProps {
  canWrite?: boolean;
  family: Family;
  isGeneratedLineSettingSaving?: boolean;
  isSaving?: boolean;
  mutationError?: string;
  mutationErrorKey?: string;
  onAddCategory: (input: CreateFamilyCategoryInput) => Promise<void> | void;
  onAddMember: (input: CreateFamilyMemberInput) => Promise<void> | void;
  onCreateRecurringLine: (
    input: CreateRecurringLineInput,
  ) => Promise<void> | void;
  onDeleteCategory: (categoryId: string) => Promise<void> | void;
  onDeleteMember: (memberId: string) => Promise<void> | void;
  onDeleteRecurringLine: (lineId: string) => Promise<void> | void;
  onUpdateGeneratedRecurringLineSetting: (
    input: UpdateGeneratedRecurringLineSettingInput,
  ) => Promise<void> | void;
  onUpdateMember: (
    memberId: string,
    input: UpdateFamilyMemberInput,
  ) => Promise<void> | void;
  onUpdateRecurringLine: (
    lineId: string,
    input: UpdateRecurringLineInput,
  ) => Promise<void> | void;
}

export function FamilyDashboard({
  canWrite = true,
  family,
  isGeneratedLineSettingSaving = false,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onAddCategory,
  onAddMember,
  onCreateRecurringLine,
  onDeleteCategory,
  onDeleteMember,
  onDeleteRecurringLine,
  onUpdateGeneratedRecurringLineSetting,
  onUpdateMember,
  onUpdateRecurringLine,
}: FamilyDashboardProps) {
  const { t } = useTranslation();
  const { isMemberVisible, toggleMemberVisibility } =
    useFamilyMemberVisibility();
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
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null,
  );
  const [sidebarItemPendingDeletion, setSidebarItemPendingDeletion] =
    useState<SidebarDeletionTarget | null>(null);
  const [summaryLine, setSummaryLine] = useState<FamilyBudgetLine | null>(null);
  const [selectedLine, setSelectedLine] = useState<RecurringLine | null>(null);
  const [generatedSavingLineId, setGeneratedSavingLineId] = useState<
    string | null
  >(null);
  const hiddenMemberIds = new Set(
    family.members.flatMap((member) =>
      isMemberVisible(member.id) ? [] : [member.id],
    ),
  );
  const hiddenCategoryIds = new Set(
    family.categories.flatMap((category) =>
      category.ownerId && !isMemberVisible(category.ownerId)
        ? [category.id]
        : [],
    ),
  );
  const visibleCategories = family.categories.filter(
    (category) => !hiddenCategoryIds.has(category.id),
  );
  const visibleRecurringLines = family.recurringLines.filter(
    (line) => !hiddenCategoryIds.has(line.categoryId),
  );
  const visibleGeneratedLines = getGeneratedRecurringLines(family).filter(
    (line) => line.source === "loans" || !hiddenMemberIds.has(line.sourceId),
  );
  const budgetLines = [
    ...toManualFamilyBudgetLines(visibleRecurringLines),
    ...visibleGeneratedLines,
  ];

  function handleAddLine() {
    if (!canWrite) {
      return;
    }

    setLineDialogMode("create");
    setSelectedLine(
      createDraftRecurringLine(
        { ...family, categories: visibleCategories },
        `new-line-${Date.now()}`,
      ),
    );
  }

  function handleEditLine(line: RecurringLine) {
    if (!canWrite) {
      return;
    }

    setLineDialogMode("edit");
    setSelectedLine(line);
  }

  function handleViewLine(line: RecurringLine) {
    setSummaryLine({ kind: "manual", line });
  }

  function handleViewBudgetLine(line: FamilyBudgetLine) {
    setSummaryLine(line);
  }

  function handleRequestAddMember() {
    if (!canWrite) {
      return;
    }

    setSelectedMember(null);
    setIsMemberModalOpen(true);
  }

  function handleRequestEditMember(member: FamilyMember) {
    if (!canWrite) {
      return;
    }

    setSelectedMember(member);
    setIsMemberModalOpen(true);
  }

  async function handleSaveCategory(input: CreateFamilyCategoryInput) {
    if (!canWrite) {
      return;
    }

    const duplicateError = getDuplicateFamilyCategoryLabelError(
      family.categories,
      input.label,
    );

    if (duplicateError) {
      showLocalError(getFamilyLocalValidationErrorMessage(duplicateError, t));
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

  async function handleSaveMember(input: UpdateFamilyMemberInput) {
    if (!canWrite) {
      return;
    }

    const ignoredCategoryIds = selectedMember
      ? getFamilyMemberLinkedCategoryIds(family.categories, selectedMember.id)
      : [];
    const duplicateError =
      getDuplicateFamilyMemberNameError(
        family.members,
        input.name,
        selectedMember?.id,
      ) ??
      getDuplicateFamilyCategoryLabelError(
        family.categories,
        input.name,
        ignoredCategoryIds,
      );

    if (duplicateError) {
      showLocalError(getFamilyLocalValidationErrorMessage(duplicateError, t));
      return;
    }

    try {
      if (selectedMember) {
        await onUpdateMember(selectedMember.id, input);
      } else {
        await onAddMember(input);
      }

      setLocalError(null);
      setIsMemberModalOpen(false);
    } catch {
      return;
    }
  }

  async function handleSaveLine(line: RecurringLine) {
    if (!canWrite) {
      return;
    }

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
    if (!canWrite) {
      return;
    }

    setLinePendingDeletion(line);
  }

  async function handleToggleGeneratedLine(line: GeneratedFamilyBudgetLine) {
    if (!canWrite) {
      return;
    }

    setGeneratedSavingLineId(line.line.id);

    try {
      await onUpdateGeneratedRecurringLineSetting({
        isEnabled: !line.isEnabled,
        source: line.source,
        sourceId: line.sourceId,
      });
    } catch {
      return;
    } finally {
      setGeneratedSavingLineId(null);
    }
  }

  function handleRequestDeleteMember(member: FamilyMember) {
    if (!canWrite) {
      return;
    }

    setSidebarItemPendingDeletion({ item: member, type: "member" });
  }

  function handleRequestDeleteCategory(category: FamilyCategory) {
    if (!canWrite) {
      return;
    }

    setSidebarItemPendingDeletion({ item: category, type: "category" });
  }

  async function handleConfirmDeleteLine() {
    if (!canWrite || !linePendingDeletion) {
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
    if (!canWrite || !sidebarItemPendingDeletion) {
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
    <>
      <AppShellTop>
        <FamilySummaryStrip lines={budgetLines} />
      </AppShellTop>
      <AppShellContent>
        <FamilyBudgetTable
          categories={visibleCategories}
          disabled={isSaving}
          generatedSavingLineId={generatedSavingLineId}
          isGeneratedLineSettingSaving={isGeneratedLineSettingSaving}
          lines={budgetLines}
          onAddLine={handleAddLine}
          onDeleteLine={handleRequestDeleteLine}
          onEditLine={handleEditLine}
          onToggleGeneratedLine={handleToggleGeneratedLine}
          onViewBudgetLine={handleViewBudgetLine}
          onViewLine={handleViewLine}
          readonly={!canWrite}
        />
        <FeedbackSnackbar
          key={localError ? `local-${localError.revision}` : mutationErrorKey}
          message={localError?.message ?? mutationError}
        />

        <FamilyCategoryModal
          isSaving={isSaving}
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={handleSaveCategory}
          open={isCategoryModalOpen}
        />
        <FamilyMemberModal
          initialMember={selectedMember}
          isSaving={isSaving}
          mode={selectedMember ? "edit" : "create"}
          onClose={() => setIsMemberModalOpen(false)}
          onExited={() => setSelectedMember(null)}
          onSave={handleSaveMember}
          open={isMemberModalOpen}
        />
        <LineEditDialog
          categories={visibleCategories}
          isSaving={isSaving}
          line={selectedLine}
          mode={lineDialogMode}
          onClose={() => setSelectedLine(null)}
          onSave={handleSaveLine}
          open={selectedLine !== null}
        />
        <LineSummaryDialog
          categoryLabel={getCategoryLabel(family, summaryLine, t)}
          line={summaryLine}
          onClose={() => setSummaryLine(null)}
          open={summaryLine !== null}
        />
        <ConfirmationDialog
          confirmColor="error"
          confirmFirst
          cancelLabel={t("common.cancel")}
          confirmLabel={t("family.deletion.confirm")}
          description={t("family.deletion.memberDescription")}
          isPending={isSaving}
          onCancel={() => setSidebarItemPendingDeletion(null)}
          onConfirm={handleConfirmDeleteSidebarItem}
          open={sidebarItemPendingDeletion?.type === "member"}
          title={t("family.deletion.memberTitle")}
        />
        <ConfirmationDialog
          confirmColor="error"
          confirmFirst
          cancelLabel={t("common.cancel")}
          confirmLabel={t("family.deletion.confirm")}
          description={t("family.deletion.categoryDescription")}
          isPending={isSaving}
          onCancel={() => setSidebarItemPendingDeletion(null)}
          onConfirm={handleConfirmDeleteSidebarItem}
          open={sidebarItemPendingDeletion?.type === "category"}
          title={t("family.deletion.categoryTitle")}
        />
        <ConfirmationDialog
          confirmColor="error"
          confirmFirst
          cancelLabel={t("common.cancel")}
          confirmLabel={t("family.deletion.confirm")}
          description={t("family.deletion.lineDescription")}
          isPending={isSaving}
          onCancel={() => setLinePendingDeletion(null)}
          onConfirm={handleConfirmDeleteLine}
          open={linePendingDeletion !== null}
          title={t("family.deletion.lineTitle")}
        />
      </AppShellContent>
      <AppShellWidgets>
        <FamilySidebar
          categories={family.categories}
          disabled={isSaving}
          isMemberVisible={isMemberVisible}
          members={family.members}
          onAddCategory={
            canWrite ? () => setIsCategoryModalOpen(true) : undefined
          }
          onAddMember={canWrite ? handleRequestAddMember : undefined}
          onDeleteCategory={canWrite ? handleRequestDeleteCategory : undefined}
          onDeleteMember={canWrite ? handleRequestDeleteMember : undefined}
          onEditMember={canWrite ? handleRequestEditMember : undefined}
          onToggleMemberVisibility={(member) =>
            toggleMemberVisibility(member.id)
          }
        />
      </AppShellWidgets>
    </>
  );
}

type SidebarDeletionTarget =
  | { item: FamilyMember; type: "member" }
  | { item: FamilyCategory; type: "category" };

function getCategoryLabel(
  family: Family,
  line: FamilyBudgetLine | null,
  t: TFunction,
): string {
  if (!line) {
    return "";
  }

  if (line.kind === "generated") {
    return t("family.budget.generatedCategory");
  }

  return (
    family.categories.find((category) => category.id === line.line.categoryId)
      ?.label ?? line.line.categoryId
  );
}

function getFamilyLocalValidationErrorMessage(
  error: FamilyLocalValidationError,
  t: TFunction,
): string {
  if (error === "duplicateCategoryLabel") {
    return t("family.localErrors.duplicateCategoryLabel");
  }

  return t("family.localErrors.duplicateMemberName");
}
