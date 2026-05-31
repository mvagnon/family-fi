export interface FamilyMutation {
  error: Error | null;
  submittedAt: number;
}

export function getFamilyMutationError(mutations: FamilyMutation[]) {
  const mutation = mutations.reduce<FamilyMutation | undefined>(
    (latestMutation, currentMutation) => {
      if (!currentMutation.error) {
        return latestMutation;
      }

      if (
        !latestMutation ||
        currentMutation.submittedAt >= latestMutation.submittedAt
      ) {
        return currentMutation;
      }

      return latestMutation;
    },
    undefined,
  );
  const message = mutation?.error?.message;

  if (!mutation || !message) {
    return undefined;
  }

  return {
    key: `${mutation.submittedAt}-${message}`,
    message,
  };
}
