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
} from "../application/family-local-commands";
import type {
  CreateFamilyMemberInput,
  CreateParticipationLineInput,
  Family,
  FamilyMember,
} from "../domain/family";
import {
  getFamilyParticipationProjection,
  resolveParticipationLineMember,
  type ParticipationMemberResolution,
} from "../domain/family-participations";
import { FamilyParticipationLineModal } from "./family-participation-line-modal";
import { FamilyMemberModal } from "./family-member-modal";
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
  onDeleteMember: (memberId: string) => Promise<void> | void;
}

export function FamilyParticipationsDashboard({
  family,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onAddMember,
  onCreateParticipationLine,
  onDeleteMember,
}: FamilyParticipationsDashboardProps) {
  const { t } = useTranslation();
  const currentDate = new Date();
  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [year, setYear] = useState(currentYear);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberPendingDeletion, setMemberPendingDeletion] =
    useState<FamilyMember | null>(null);
  const [localError, setLocalError] = useState<{
    message: string;
    revision: number;
  } | null>(null);
  const projection = getFamilyParticipationProjection(family, {
    currentMonthIndex,
    currentYear,
    year,
  });
  const defaultCreationMember = projection.activeMembers[0];

  function handleYearChange(nextYear: number) {
    setYear(Math.min(nextYear, currentYear));
  }

  function handleAddLine() {
    if (!projection.activeMembers.length || !defaultCreationMember) {
      showLocalError(t("participations.creation.errors.noActiveMember"));
      return;
    }

    setIsCreateModalOpen(true);
  }

  async function handleSaveMember(input: CreateFamilyMemberInput) {
    const duplicateError =
      getDuplicateFamilyMemberNameError(family.members, input.name) ??
      getDuplicateFamilyCategoryLabelError(family.categories, input.name);

    if (duplicateError) {
      showLocalError(
        duplicateError === "duplicateCategoryLabel"
          ? t("family.localErrors.duplicateCategoryLabel")
          : t("family.localErrors.duplicateMemberName"),
      );
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

  async function handleSaveLine(input: CreateParticipationLineInput) {
    const resolution = resolveParticipationLineMember(family, input.memberId);

    if (resolution.status !== "available") {
      showLocalError(getParticipationMemberResolutionMessage(resolution, t));
      return;
    }

    try {
      await onCreateParticipationLine(input);
      setLocalError(null);
      setIsCreateModalOpen(false);
      setYear(input.year);
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
        />
        <FeedbackSnackbar
          key={localError ? `local-${localError.revision}` : mutationErrorKey}
          message={localError?.message ?? mutationError}
        />
        {defaultCreationMember ? (
          <FamilyParticipationLineModal
            activeMembers={projection.activeMembers}
            currentMonthIndex={currentMonthIndex}
            currentYear={currentYear}
            defaultMemberId={defaultCreationMember.id}
            defaultYear={year}
            isSaving={isSaving}
            key={`${defaultCreationMember.id}-${year}`}
            onClose={() => setIsCreateModalOpen(false)}
            onSave={handleSaveLine}
            open={isCreateModalOpen}
          />
        ) : null}
        <FamilyMemberModal
          isSaving={isSaving}
          onClose={() => setIsMemberModalOpen(false)}
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
      </AppShellContent>
      <AppShellWidgets>
        <FamilySidebarMembers
          disabled={isSaving}
          members={family.members}
          onAddMember={() => setIsMemberModalOpen(true)}
          onDeleteMember={setMemberPendingDeletion}
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
