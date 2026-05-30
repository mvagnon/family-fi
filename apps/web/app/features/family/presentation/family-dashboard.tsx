import { useState } from "react";
import { ConfirmationDialog } from "@repo/ui/confirmation-dialog";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import { PageShell } from "@repo/ui/page-shell";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import {
  getDuplicateFamilyCategoryLabelError,
  getDuplicateFamilyMemberNameError,
  type FamilyLocalValidationError,
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
import { FamilySidebarNavigation } from "./family-sidebar-navigation";
import { FamilySummaryStrip } from "./family-summary-strip";
import { LineEditDialog } from "./line-edit-dialog";
import { LineSummaryDialog } from "./line-summary-dialog";

interface FamilyDashboardProps {
  family: Family;
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
  onUpdateRecurringLine: (
    lineId: string,
    input: UpdateRecurringLineInput,
  ) => Promise<void> | void;
}

export function FamilyDashboard({
  family,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onAddCategory,
  onAddMember,
  onCreateRecurringLine,
  onDeleteCategory,
  onDeleteMember,
  onDeleteRecurringLine,
  onUpdateRecurringLine,
}: FamilyDashboardProps) {
  const { t } = useTranslation();
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

  async function handleSaveMember(input: CreateFamilyMemberInput) {
    const duplicateError =
      getDuplicateFamilyMemberNameError(family.members, input.name) ??
      getDuplicateFamilyCategoryLabelError(family.categories, input.name);

    if (duplicateError) {
      showLocalError(getFamilyLocalValidationErrorMessage(duplicateError, t));
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
      navigation={<FamilySidebarNavigation />}
      top={<FamilySummaryStrip lines={family.recurringLines} />}
      widgets={
        <FamilySidebar
          categories={family.categories}
          disabled={isSaving}
          members={family.members}
          onAddCategory={() => setIsCategoryModalOpen(true)}
          onAddMember={() => setIsMemberModalOpen(true)}
          onDeleteCategory={handleRequestDeleteCategory}
          onDeleteMember={handleRequestDeleteMember}
        />
      }
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

function getFamilyLocalValidationErrorMessage(
  error: FamilyLocalValidationError,
  t: TFunction,
): string {
  if (error === "duplicateCategoryLabel") {
    return t("family.localErrors.duplicateCategoryLabel");
  }

  return t("family.localErrors.duplicateMemberName");
}
