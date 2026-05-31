import { useState } from "react";
import { FeedbackSnackbar } from "@repo/ui/feedback-snackbar";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import {
  AppShellContent,
  AppShellTop,
  AppShellWidgets,
} from "../../app-shell/presentation/app-shell-layout";
import {
  createDraftRecurringLine,
  toCreateRecurringLineInput,
} from "../application/family-line-commands";
import type {
  CreateRecurringLineInput,
  Family,
  RecurringLine,
} from "../domain/family";
import {
  getFamilyParticipationProjection,
  getParticipationCreationOptions,
  resolveParticipationLineCategory,
  type ParticipationCategoryResolution,
} from "../domain/family-participations";
import { FamilySidebarMembers } from "./family-sidebar-members";
import { FamilyParticipationsTable } from "./family-participations-table";
import { FamilyParticipationsTop } from "./family-participations-top";
import { LineEditDialog } from "./line-edit-dialog";

interface FamilyParticipationsDashboardProps {
  family: Family;
  isSaving?: boolean;
  mutationError?: string;
  mutationErrorKey?: string;
  onCreateRecurringLine: (
    input: CreateRecurringLineInput,
  ) => Promise<void> | void;
}

export function FamilyParticipationsDashboard({
  family,
  isSaving = false,
  mutationError,
  mutationErrorKey,
  onCreateRecurringLine,
}: FamilyParticipationsDashboardProps) {
  const { t } = useTranslation();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<RecurringLine | null>(null);
  const [localError, setLocalError] = useState<{
    message: string;
    revision: number;
  } | null>(null);
  const projection = getFamilyParticipationProjection(family, {
    selectedMemberId,
    year,
  });
  const selectedMemberIdValue = projection.selectedMember?.id ?? "";
  const selectedParticipation = projection.selectedMemberParticipation;
  const creationOptions = getParticipationCreationOptions(family);
  const availableCreationOptions = creationOptions.flatMap((option) => {
    if (!option.category) {
      return [];
    }

    return [
      {
        label: option.member.name,
        value: option.category.id,
      },
    ];
  });
  const unavailableActiveMemberNames = creationOptions
    .filter((option) => !option.category)
    .map((option) => option.member.name);

  function handleAddLine() {
    const categoryId = getDefaultCreationCategoryId(
      availableCreationOptions.map((option) => option.value),
      family,
      selectedMemberIdValue,
    );

    if (!projection.activeMembers.length) {
      showLocalError(t("participations.creation.errors.noActiveMember"));
      return;
    }

    if (!categoryId) {
      showLocalError(t("participations.creation.errors.missingCategory"));
      return;
    }

    setSelectedLine({
      ...createDraftRecurringLine(family, `new-participation-${Date.now()}`),
      categoryId,
    });
  }

  async function handleSaveLine(line: RecurringLine) {
    const resolution = resolveParticipationLineCategory(
      family,
      line.categoryId,
    );

    if (resolution.status !== "available") {
      showLocalError(getParticipationCategoryResolutionMessage(resolution, t));
      return;
    }

    try {
      await onCreateRecurringLine(
        toCreateRecurringLineInput({
          ...line,
          categoryId: resolution.category.id,
        }),
      );
      setLocalError(null);
      setSelectedLine(null);
      setSelectedMemberId(resolution.member.id);
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
          members={projection.selectableMembers}
          onMemberChange={setSelectedMemberId}
          onYearChange={setYear}
          selectedMember={projection.selectedMember}
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
          selectedMember={projection.selectedMember}
        />
        <FeedbackSnackbar
          key={localError ? `local-${localError.revision}` : mutationErrorKey}
          message={localError?.message ?? mutationError}
        />
        <LineEditDialog
          categories={family.categories}
          categoryFieldLabel={t("participations.creation.memberField")}
          categoryHelperText={getCreationCategoryHelperText(
            unavailableActiveMemberNames,
            t,
          )}
          categoryOptions={availableCreationOptions}
          categoryPlaceholder={t("participations.creation.selectMember")}
          createTitle={t("participations.creation.title")}
          isSaving={isSaving}
          line={selectedLine}
          mode="create"
          onClose={() => setSelectedLine(null)}
          onSave={handleSaveLine}
          open={selectedLine !== null}
        />
      </AppShellContent>
      <AppShellWidgets>
        <FamilySidebarMembers disabled={isSaving} members={family.members} />
      </AppShellWidgets>
    </>
  );
}

function getDefaultCreationCategoryId(
  availableCategoryIds: string[],
  family: Family,
  selectedMemberId: string,
): string | null {
  const selectedCategory = family.categories.find(
    (category) =>
      category.kind === "professional" &&
      category.ownerId === selectedMemberId &&
      availableCategoryIds.includes(category.id),
  );

  return selectedCategory?.id ?? availableCategoryIds[0] ?? null;
}

function getCreationCategoryHelperText(
  memberNames: string[],
  t: TFunction,
): string | undefined {
  if (!memberNames.length) {
    return undefined;
  }

  return t("participations.creation.missingCategoryHint", {
    names: memberNames.join(", "),
  });
}

function getParticipationCategoryResolutionMessage(
  resolution: Exclude<ParticipationCategoryResolution, { status: "available" }>,
  t: TFunction,
): string {
  if (resolution.status === "inactive-member") {
    return t("participations.creation.errors.inactiveMember");
  }

  if (resolution.status === "missing-member") {
    return t("participations.creation.errors.missingMember");
  }

  return t("participations.creation.errors.missingCategory");
}
