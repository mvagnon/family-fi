import { useState } from "react";
import Typography from "@mui/material/Typography";
import { ConfirmationDialog } from "@repo/ui/confirmation-dialog";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
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
} from "../application/family-local-commands";
import type {
  CreateDistributionLineInput,
  CreateFamilyMemberInput,
  DistributionLine,
  Family,
  FamilyMember,
  UpdateDistributionLineInput,
  UpdateFamilyMemberInput,
} from "../domain/family";
import {
  type FamilyDistributionLine,
  getFamilyDistributionProjection,
} from "../domain/family-distributions";
import { FamilyDistributionLineModal } from "./family-distribution-line-modal";
import { FamilyDistributionsTable } from "./family-distributions-table";
import { FamilyDistributionsTop } from "./family-distributions-top";
import { FamilyMemberModal } from "./family-member-modal";
import { useFamilyMemberVisibility } from "./family-member-visibility-provider";
import { FamilySidebarMembers } from "./family-sidebar-members";
import { useFamilyFormat } from "./use-family-format";

interface FamilyDistributionsDashboardProps {
  family: Family;
  isSaving?: boolean;
  mutationError?: string;
  mutationErrorKey?: string;
  onAddMember: (input: CreateFamilyMemberInput) => Promise<void> | void;
  onCreateDistributionLine: (
    input: CreateDistributionLineInput,
  ) => Promise<void> | void;
  onDeleteDistributionLine: (lineId: string) => Promise<void> | void;
  onDeleteMember: (memberId: string) => Promise<void> | void;
  onUpdateDistributionLine: (
    lineId: string,
    input: UpdateDistributionLineInput,
  ) => Promise<void> | void;
  onUpdateMember: (
    memberId: string,
    input: UpdateFamilyMemberInput,
  ) => Promise<void> | void;
}

export function FamilyDistributionsDashboard({
  family,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onAddMember,
  onCreateDistributionLine,
  onDeleteDistributionLine,
  onDeleteMember,
  onUpdateDistributionLine,
  onUpdateMember,
}: FamilyDistributionsDashboardProps) {
  const { t } = useTranslation();
  const familyFormat = useFamilyFormat();
  const { isMemberVisible, toggleMemberVisibility } =
    useFamilyMemberVisibility();
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [lineDialogMode, setLineDialogMode] = useState<"create" | "edit">(
    "create",
  );
  const [linePendingDeletion, setLinePendingDeletion] =
    useState<FamilyDistributionLine | null>(null);
  const [memberPendingDeletion, setMemberPendingDeletion] =
    useState<FamilyMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null,
  );
  const [selectedLine, setSelectedLine] = useState<DistributionLine | null>(
    null,
  );
  const [localError, setLocalError] = useState<{
    message: string;
    revision: number;
  } | null>(null);
  const visibleMembers = family.members.filter((member) =>
    isMemberVisible(member.id),
  );
  const visibleMemberIds = new Set(visibleMembers.map((member) => member.id));
  const projection = getFamilyDistributionProjection(family, {
    currentMonthIndex,
    currentYear,
    visibleMemberIds,
    year,
  });
  const memberBalancesById = new Map(
    projection.memberBalances.map((item) => [item.member.id, item.balance]),
  );
  const lineModalMembers = getDistributionLineModalMembers(
    projection.activeMembers,
    family.members,
    selectedLine,
  );

  function handleYearChange(nextYear: number) {
    setYear(Math.min(nextYear, currentYear));
  }

  function handleAddLine() {
    if (!projection.activeMembers.length) {
      showLocalError(t("distributions.creation.errors.noActiveMember"));
      return;
    }

    setLineDialogMode("create");
    setSelectedLine(null);
    setIsLineModalOpen(true);
  }

  function handleEditLine(line: FamilyDistributionLine) {
    setLineDialogMode("edit");
    setSelectedLine(line.line);
    setIsLineModalOpen(true);
  }

  function handleRequestAddMember() {
    setSelectedMember(null);
    setIsMemberModalOpen(true);
  }

  function handleRequestEditMember(member: FamilyMember) {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  }

  async function handleSaveMember(input: UpdateFamilyMemberInput) {
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
      showLocalError(
        duplicateError === "duplicateCategoryLabel"
          ? t("family.localErrors.duplicateCategoryLabel")
          : t("family.localErrors.duplicateMemberName"),
      );
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

  async function handleSaveLine(input: CreateDistributionLineInput) {
    if (lineDialogMode === "edit" && !selectedLine) {
      return;
    }

    try {
      if (lineDialogMode === "create") {
        await onCreateDistributionLine(input);
      } else if (selectedLine) {
        await onUpdateDistributionLine(selectedLine.id, input);
      }

      setLocalError(null);
      setIsLineModalOpen(false);
      setSelectedLine(null);
      setYear(input.year);
    } catch {
      return;
    }
  }

  async function handleConfirmDeleteLine() {
    if (!linePendingDeletion) {
      return;
    }

    try {
      await onDeleteDistributionLine(linePendingDeletion.line.id);
      setLinePendingDeletion(null);
    } catch {
      return;
    }
  }

  async function handleConfirmDeleteMember() {
    if (!memberPendingDeletion) {
      return;
    }

    try {
      await onDeleteMember(memberPendingDeletion.id);
      setMemberPendingDeletion(null);
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
        <FamilyDistributionsTop
          currentYear={currentYear}
          onYearChange={handleYearChange}
          summary={projection.summary}
          year={year}
        />
      </AppShellTop>
      <AppShellContent>
        <FamilyDistributionsTable
          disabled={isSaving}
          hasMembers={projection.activeMembers.length > 0}
          key={year}
          monthGroups={projection.monthGroups}
          onAddLine={handleAddLine}
          onDeleteLine={setLinePendingDeletion}
          onEditLine={handleEditLine}
        />
        <FeedbackSnackbar
          key={localError ? `local-${localError.revision}` : mutationErrorKey}
          message={localError?.message ?? mutationError}
        />
        {lineModalMembers.length > 0 ? (
          <FamilyDistributionLineModal
            currentMonthIndex={currentMonthIndex}
            currentYear={currentYear}
            defaultYear={year}
            initialLine={selectedLine ?? undefined}
            isSaving={isSaving}
            key={
              selectedLine
                ? `${lineDialogMode}-${selectedLine.id}`
                : `${lineDialogMode}-${year}-${lineModalMembers
                    .map((member) => member.id)
                    .join("-")}`
            }
            memberBalances={projection.memberBalances}
            members={lineModalMembers}
            mode={lineDialogMode}
            onClose={() => setIsLineModalOpen(false)}
            onSave={handleSaveLine}
            open={isLineModalOpen}
          />
        ) : null}
        <FamilyMemberModal
          initialMember={selectedMember}
          isSaving={isSaving}
          mode={selectedMember ? "edit" : "create"}
          onClose={() => setIsMemberModalOpen(false)}
          onExited={() => setSelectedMember(null)}
          onSave={handleSaveMember}
          open={isMemberModalOpen}
        />
        <ConfirmationDialog
          confirmColor="error"
          confirmFirst
          cancelLabel={t("common.cancel")}
          confirmLabel={t("family.deletion.confirm")}
          description={t("family.deletion.memberDescription")}
          isPending={isSaving}
          onCancel={() => setMemberPendingDeletion(null)}
          onConfirm={handleConfirmDeleteMember}
          open={memberPendingDeletion !== null}
          title={t("family.deletion.memberTitle")}
        />
        <ConfirmationDialog
          confirmColor="error"
          confirmFirst
          cancelLabel={t("common.cancel")}
          confirmLabel={t("family.deletion.confirm")}
          description={t("distributions.deletion.lineDescription")}
          isPending={isSaving}
          onCancel={() => setLinePendingDeletion(null)}
          onConfirm={handleConfirmDeleteLine}
          open={linePendingDeletion !== null}
          title={t("distributions.deletion.lineTitle")}
        />
      </AppShellContent>
      <AppShellWidgets>
        <FamilySidebarMembers
          disabled={isSaving}
          getMemberSecondaryContent={(member) => {
            const balance = memberBalancesById.get(member.id) ?? 0;

            return (
              <Typography
                color={
                  balance > 0
                    ? "success.main"
                    : balance < 0
                      ? "error.main"
                      : "text.secondary"
                }
                variant="body2"
              >
                {t("distributions.sidebar.balance", {
                  amount: familyFormat.formatCurrency(balance),
                })}
              </Typography>
            );
          }}
          isMemberVisible={isMemberVisible}
          members={family.members}
          onAddMember={handleRequestAddMember}
          onDeleteMember={setMemberPendingDeletion}
          onEditMember={handleRequestEditMember}
          onToggleMemberVisibility={(member) =>
            toggleMemberVisibility(member.id)
          }
        />
      </AppShellWidgets>
    </>
  );
}

function getDistributionLineModalMembers(
  activeMembers: FamilyMember[],
  allMembers: FamilyMember[],
  selectedLine: DistributionLine | null,
): FamilyMember[] {
  if (!selectedLine) {
    return activeMembers;
  }

  const membersById = new Map(allMembers.map((member) => [member.id, member]));
  const selectedMembers = selectedLine.memberAmounts.flatMap((memberAmount) => {
    const member = membersById.get(memberAmount.memberId);

    return member ? [member] : [];
  });
  const activeMemberIds = new Set(activeMembers.map((member) => member.id));
  const missingSelectedMembers = selectedMembers.filter(
    (member) => !activeMemberIds.has(member.id),
  );

  return [...activeMembers, ...missingSelectedMembers];
}
