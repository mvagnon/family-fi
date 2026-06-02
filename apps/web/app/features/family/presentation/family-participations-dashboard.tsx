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
} from "../application/family-local-commands";
import type {
  CreateFamilyMemberInput,
  CreateParticipationLineInput,
  Family,
  FamilyMember,
  ParticipationLine,
  UpdateFamilyMemberInput,
  UpdateParticipationLineInput,
} from "../domain/family";
import {
  type FamilyParticipationLine,
  getFamilyParticipationProjection,
  resolveParticipationLineMember,
  type ParticipationMemberResolution,
} from "../domain/family-participations";
import { FamilyParticipationLineModal } from "./family-participation-line-modal";
import { FamilyMemberModal } from "./family-member-modal";
import { useFamilyMemberVisibility } from "./family-member-visibility-provider";
import { FamilySidebarMembers } from "./family-sidebar-members";
import { FamilyParticipationsTable } from "./family-participations-table";
import { FamilyParticipationsTop } from "./family-participations-top";

interface FamilyParticipationsDashboardProps {
  family: Family;
  isSaving?: boolean;
  mutationError?: string;
  mutationErrorKey?: string;
  onAddMember: (input: CreateFamilyMemberInput) => Promise<void> | void;
  onCreateParticipationLine: (
    input: CreateParticipationLineInput,
  ) => Promise<void> | void;
  onDeleteParticipationLine: (lineId: string) => Promise<void> | void;
  onDeleteMember: (memberId: string) => Promise<void> | void;
  onUpdateMember: (
    memberId: string,
    input: UpdateFamilyMemberInput,
  ) => Promise<void> | void;
  onUpdateParticipationLine: (
    lineId: string,
    input: UpdateParticipationLineInput,
  ) => Promise<void> | void;
}

export function FamilyParticipationsDashboard({
  family,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onAddMember,
  onCreateParticipationLine,
  onDeleteParticipationLine,
  onDeleteMember,
  onUpdateMember,
  onUpdateParticipationLine,
}: FamilyParticipationsDashboardProps) {
  const { t } = useTranslation();
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
    useState<ParticipationLine | null>(null);
  const [memberPendingDeletion, setMemberPendingDeletion] =
    useState<FamilyMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null,
  );
  const [selectedLine, setSelectedLine] = useState<ParticipationLine | null>(
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
  const projection = getFamilyParticipationProjection(family, {
    currentMonthIndex,
    currentYear,
    visibleMemberIds,
    year,
  });
  const defaultCreationMember = projection.activeMembers[0];
  const lineModalDefaultMemberId =
    selectedLine?.memberId ?? defaultCreationMember?.id;
  const lineModalMembers = getParticipationLineModalMembers(
    projection.activeMembers,
    visibleMembers,
    selectedLine?.memberId,
  );

  function handleYearChange(nextYear: number) {
    setYear(Math.min(nextYear, currentYear));
  }

  function handleAddLine() {
    if (!projection.activeMembers.length || !defaultCreationMember) {
      showLocalError(t("participations.creation.errors.noActiveMember"));
      return;
    }

    setLineDialogMode("create");
    setSelectedLine(null);
    setIsLineModalOpen(true);
  }

  function handleEditLine(line: FamilyParticipationLine) {
    setLineDialogMode("edit");
    setSelectedLine(line.line);
    setIsLineModalOpen(true);
  }

  function handleRequestDeleteLine(line: FamilyParticipationLine) {
    setLinePendingDeletion(line.line);
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

  async function handleSaveLine(input: CreateParticipationLineInput) {
    if (lineDialogMode === "edit" && !selectedLine) {
      return;
    }

    const resolution = resolveParticipationLineMember(family, input.memberId);

    if (resolution.status !== "available") {
      showLocalError(getParticipationMemberResolutionMessage(resolution, t));
      return;
    }

    try {
      if (lineDialogMode === "create") {
        await onCreateParticipationLine(input);
      } else if (selectedLine) {
        await onUpdateParticipationLine(selectedLine.id, input);
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
      await onDeleteParticipationLine(linePendingDeletion.id);
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
        <FamilyParticipationsTop
          currentYear={currentYear}
          onYearChange={handleYearChange}
          summary={projection.summary}
          year={year}
        />
      </AppShellTop>
      <AppShellContent>
        <FamilyParticipationsTable
          disabled={isSaving}
          key={year}
          monthGroups={projection.monthGroups}
          onAddLine={handleAddLine}
          onDeleteLine={handleRequestDeleteLine}
          onEditLine={handleEditLine}
        />
        <FeedbackSnackbar
          key={localError ? `local-${localError.revision}` : mutationErrorKey}
          message={localError?.message ?? mutationError}
        />
        {lineModalDefaultMemberId ? (
          <FamilyParticipationLineModal
            currentMonthIndex={currentMonthIndex}
            currentYear={currentYear}
            defaultMemberId={lineModalDefaultMemberId}
            defaultYear={year}
            initialLine={
              selectedLine ? toParticipationLineInput(selectedLine) : undefined
            }
            isSaving={isSaving}
            key={
              selectedLine
                ? `${lineDialogMode}-${selectedLine.id}`
                : `${lineDialogMode}-${lineModalDefaultMemberId}-${year}`
            }
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
          description={t("participations.deletion.lineDescription")}
          isPending={isSaving}
          onCancel={() => setLinePendingDeletion(null)}
          onConfirm={handleConfirmDeleteLine}
          open={linePendingDeletion !== null}
          title={t("participations.deletion.lineTitle")}
        />
      </AppShellContent>
      <AppShellWidgets>
        <FamilySidebarMembers
          disabled={isSaving}
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

function getParticipationMemberResolutionMessage(
  resolution: Exclude<ParticipationMemberResolution, { status: "available" }>,
  t: TFunction,
): string {
  if (resolution.status === "inactive-member") {
    return t("participations.creation.errors.inactiveMember");
  }

  return t("participations.creation.errors.missingMember");
}

function getParticipationLineModalMembers(
  activeMembers: FamilyMember[],
  members: FamilyMember[],
  selectedMemberId: string | undefined,
): FamilyMember[] {
  if (!selectedMemberId) {
    return activeMembers;
  }

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId,
  );

  if (
    !selectedMember ||
    activeMembers.some((member) => member.id === selectedMember.id)
  ) {
    return activeMembers;
  }

  return [...activeMembers, selectedMember];
}

function toParticipationLineInput(
  line: ParticipationLine,
): CreateParticipationLineInput {
  return {
    amount: line.amount,
    memberId: line.memberId,
    month: line.month,
    year: line.year,
  };
}
