import { useState } from "react";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import {
  AppShellContent,
  AppShellTop,
  AppShellWidgets,
} from "../../app-shell/presentation/app-shell-layout";
import type { CreateParticipationLineInput, Family } from "../domain/family";
import {
  getFamilyParticipationProjection,
  resolveParticipationLineMember,
  type ParticipationMemberResolution,
} from "../domain/family-participations";
import { FamilyParticipationLineModal } from "./family-participation-line-modal";
import { FamilySidebarMembers } from "./family-sidebar-members";
import { FamilyParticipationsTable } from "./family-participations-table";
import { FamilyParticipationsTop } from "./family-participations-top";

interface FamilyParticipationsDashboardProps {
  family: Family;
  isSaving?: boolean;
  mutationError?: string;
  mutationErrorKey?: string;
  onCreateParticipationLine: (
    input: CreateParticipationLineInput,
  ) => Promise<void> | void;
}

export function FamilyParticipationsDashboard({
  family,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onCreateParticipationLine,
}: FamilyParticipationsDashboardProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [localError, setLocalError] = useState<{
    message: string;
    revision: number;
  } | null>(null);
  const projection = getFamilyParticipationProjection(family, {
    selectedMemberId,
    year,
  });
  const selectedMember = projection.selectedMember;
  const selectedParticipation = projection.selectedMemberParticipation;
  const defaultCreationMember = selectedMember?.isActive
    ? selectedMember
    : projection.activeMembers[0];

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
      setSelectedMemberId(resolution.member.id);
      setYear(input.year);
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
          members={projection.selectableMembers}
          onMemberChange={setSelectedMemberId}
          onYearChange={handleYearChange}
          selectedMember={selectedMember}
          summary={
            selectedParticipation?.summary ?? {
              difference: 0,
              expenses: 0,
              income: 0,
            }
          }
          year={year}
        />
      </AppShellTop>
      <AppShellContent>
        <FamilyParticipationsTable
          disabled={isSaving}
          monthGroups={selectedParticipation?.monthGroups ?? []}
          onAddLine={handleAddLine}
          selectedMember={selectedMember}
        />
        <FeedbackSnackbar
          key={localError ? `local-${localError.revision}` : mutationErrorKey}
          message={localError?.message ?? mutationError}
        />
        {defaultCreationMember ? (
          <FamilyParticipationLineModal
            activeMembers={projection.activeMembers}
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
      </AppShellContent>
      <AppShellWidgets>
        <FamilySidebarMembers disabled={isSaving} members={family.members} />
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
