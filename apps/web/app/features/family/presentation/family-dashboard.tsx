import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family,
  RecurringLine,
  UpdateRecurringLineInput,
} from "../domain/family";
import { FamilyBudgetTable } from "./family-budget-table";
import { FamilyCategoryModal } from "./family-category-modal";
import { FamilyMemberModal } from "./family-member-modal";
import { FamilyPageShell } from "./family-page-shell";
import { FamilySidebar } from "./family-sidebar";
import { FamilySummaryStrip } from "./family-summary-strip";
import { LineEditDialog } from "./line-edit-dialog";

interface FamilyDashboardProps {
  family: Family;
  isSaving?: boolean;
  mutationError?: string;
  onAddCategory: (input: CreateFamilyCategoryInput) => Promise<void> | void;
  onAddMember: (input: CreateFamilyMemberInput) => Promise<void> | void;
  onCreateRecurringLine: (
    input: CreateRecurringLineInput,
  ) => Promise<void> | void;
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
  onUpdateRecurringLine,
}: FamilyDashboardProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [lineDialogMode, setLineDialogMode] = useState<"create" | "edit">(
    "edit",
  );
  const [selectedLine, setSelectedLine] = useState<RecurringLine | null>(null);

  function handleAddLine() {
    setLineDialogMode("create");
    setSelectedLine(createDraftLine(family));
  }

  function handleEditLine(line: RecurringLine) {
    setLineDialogMode("edit");
    setSelectedLine(line);
  }

  async function handleSaveCategory(input: CreateFamilyCategoryInput) {
    try {
      await onAddCategory(input);
      setIsCategoryModalOpen(false);
    } catch {
      return;
    }
  }

  async function handleSaveMember(input: CreateFamilyMemberInput) {
    try {
      await onAddMember(input);
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

  return (
    <FamilyPageShell>
      {mutationError && <Alert severity="error">{mutationError}</Alert>}

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
          onEditLine={handleEditLine}
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
    </FamilyPageShell>
  );
}

function createDraftLine(family: Family): RecurringLine {
  return {
    amount: 0,
    categoryId: family.categories[0]?.id ?? "budget",
    description: "",
    id: `new-line-${Date.now()}`,
    isEstimate: false,
    movement: "negative",
    recurrenceMonths: 1,
    title: "Nouvelle ligne",
  };
}

function toCreateRecurringLineInput(
  line: RecurringLine,
): CreateRecurringLineInput {
  const { id: _id, ...input } = line;

  return input;
}

function toUpdateRecurringLineInput(
  line: RecurringLine,
): UpdateRecurringLineInput {
  const { id: _id, ...input } = line;

  return input;
}
