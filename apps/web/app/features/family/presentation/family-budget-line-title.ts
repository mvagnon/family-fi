import type { TFunction } from "i18next";

import type { FamilyBudgetLine } from "../domain/family-budget";
import type { GeneratedRecurringLineSource } from "../domain/family";

const generatedLinePageTranslationKeys = {
  distribution: "appShell.navigation.distribution",
  loans: "appShell.navigation.loans",
  participations: "appShell.navigation.participations",
} satisfies Record<GeneratedRecurringLineSource, string>;

export function getFamilyBudgetLineTitle(
  line: FamilyBudgetLine,
  t: TFunction,
): string {
  if (line.kind === "manual") {
    return line.line.title;
  }

  return `${getGeneratedLinePageTitle(line.source, t)}: ${line.line.title}`;
}

export function getGeneratedLinePageTitle(
  source: GeneratedRecurringLineSource,
  t: TFunction,
): string {
  return t(generatedLinePageTranslationKeys[source]);
}
