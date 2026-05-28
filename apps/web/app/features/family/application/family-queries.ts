import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addFamilyCategory,
  addFamilyMember,
  createFamilyRecurringLine,
  fetchFamily,
  updateFamilyRecurringLine,
} from "../infrastructure/family-api";
import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateRecurringLineInput,
  Family,
  UpdateRecurringLineInput,
} from "../domain/family";

export const familyQueryKeys = {
  detail: () => ["family", "detail"] as const,
};

export function useFamily() {
  return useQuery({
    queryFn: fetchFamily,
    queryKey: familyQueryKeys.detail(),
  });
}

export function useAddFamilyMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFamilyMemberInput) => addFamilyMember(input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useAddFamilyCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFamilyCategoryInput) => addFamilyCategory(input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useCreateFamilyRecurringLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecurringLineInput) =>
      createFamilyRecurringLine(input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useUpdateFamilyRecurringLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      lineId,
    }: {
      input: UpdateRecurringLineInput;
      lineId: string;
    }) => updateFamilyRecurringLine(lineId, input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

function setFamilyCache(
  queryClient: ReturnType<typeof useQueryClient>,
  family: Family,
) {
  queryClient.setQueryData(familyQueryKeys.detail(), family);
}
