import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FamilyRepository } from "../domain/family-repository";
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

export function useFamily(repository: FamilyRepository) {
  return useQuery({
    queryFn: () => repository.getFamily(),
    queryKey: familyQueryKeys.detail(),
  });
}

export function useAddFamilyMember(repository: FamilyRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFamilyMemberInput) => repository.addMember(input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useAddFamilyCategory(repository: FamilyRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFamilyCategoryInput) =>
      repository.addCategory(input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useCreateFamilyRecurringLine(repository: FamilyRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecurringLineInput) =>
      repository.createRecurringLine(input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useUpdateFamilyRecurringLine(repository: FamilyRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      lineId,
    }: {
      input: UpdateRecurringLineInput;
      lineId: string;
    }) => repository.updateRecurringLine(lineId, input),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useDeleteFamilyRecurringLine(repository: FamilyRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lineId: string) => repository.deleteRecurringLine(lineId),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useDeleteFamilyMember(repository: FamilyRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => repository.deleteMember(memberId),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

export function useDeleteFamilyCategory(repository: FamilyRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => repository.deleteCategory(categoryId),
    onSuccess: (family) => setFamilyCache(queryClient, family),
  });
}

function setFamilyCache(
  queryClient: ReturnType<typeof useQueryClient>,
  family: Family,
) {
  queryClient.setQueryData(familyQueryKeys.detail(), family);
}
