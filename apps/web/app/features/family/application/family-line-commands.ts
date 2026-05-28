import type {
  CreateRecurringLineInput,
  Family,
  RecurringLine,
  UpdateRecurringLineInput,
} from "../domain/family";

export function createDraftRecurringLine(
  family: Family,
  id: string,
): RecurringLine {
  return {
    amount: 0,
    categoryId: family.categories[0]?.id ?? "budget",
    description: "",
    id,
    isEstimate: false,
    movement: "negative",
    recurrenceMonths: 1,
    title: "Nouvelle ligne",
  };
}

export function toCreateRecurringLineInput(
  line: RecurringLine,
): CreateRecurringLineInput {
  const { id: _id, ...input } = line;

  return input;
}

export function toUpdateRecurringLineInput(
  line: RecurringLine,
): UpdateRecurringLineInput {
  const { id: _id, ...input } = line;

  return input;
}
