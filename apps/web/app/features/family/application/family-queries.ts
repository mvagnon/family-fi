import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { FamilyRepository } from "../domain/family-repository";
import type {
  CreateFamilyCategoryInput,
  CreateFamilyMemberInput,
  CreateParticipationLineInput,
  CreateRecurringLineInput,
  Family,
  UpdateFamilyMemberInput,
  UpdateParticipationLineInput,
  UpdateRecurringLineInput,
} from "../domain/family";

export const familyQueryKeys = {
  detail: (spaceId: string) => ["family", "detail", spaceId] as const,
};

export function useFamily(repository: FamilyRepository, spaceId: string) {
  return useQuery({
    queryFn: () => repository.getFamily(spaceId),
    queryKey: familyQueryKeys.detail(spaceId),
  });
}

export function useAddFamilyMember(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFamilyMemberInput) =>
      repository.addMember(spaceId, input),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useAddFamilyCategory(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateFamilyCategoryInput) =>
      repository.addCategory(spaceId, input),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useUpdateFamilyMember(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      memberId,
    }: {
      input: UpdateFamilyMemberInput;
      memberId: string;
    }) => repository.updateMember(spaceId, memberId, input),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useCreateFamilyRecurringLine(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecurringLineInput) =>
      repository.createRecurringLine(spaceId, input),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useCreateFamilyParticipationLine(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateParticipationLineInput) =>
      repository.createParticipationLine(spaceId, input),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useUpdateFamilyParticipationLine(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      lineId,
    }: {
      input: UpdateParticipationLineInput;
      lineId: string;
    }) => repository.updateParticipationLine(spaceId, lineId, input),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useDeleteFamilyParticipationLine(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lineId: string) =>
      repository.deleteParticipationLine(spaceId, lineId),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useUpdateFamilyRecurringLine(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      lineId,
    }: {
      input: UpdateRecurringLineInput;
      lineId: string;
    }) => repository.updateRecurringLine(spaceId, lineId, input),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useDeleteFamilyRecurringLine(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lineId: string) =>
      repository.deleteRecurringLine(spaceId, lineId),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useDeleteFamilyMember(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) =>
      repository.deleteMember(spaceId, memberId),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

export function useDeleteFamilyCategory(
  repository: FamilyRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      repository.deleteCategory(spaceId, categoryId),
    onSuccess: (family) => setFamilyCache(queryClient, spaceId, family),
  });
}

function setFamilyCache(
  queryClient: ReturnType<typeof useQueryClient>,
  spaceId: string,
  family: Family,
) {
  queryClient.setQueryData(familyQueryKeys.detail(spaceId), family);
}
