import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SpaceRepository } from "../domain/space-repository";
import type {
  AddSpaceMemberInput,
  SearchSpaceUsersQuery,
  SpaceMember,
  SpaceSummary,
  SpaceUserSearchResult,
  UpdateDefaultSpaceInput,
  UpdateSpaceMemberInput,
  UpdateSpaceCurrencyInput,
  UserSettings,
} from "../domain/spaces";

export const spaceQueryKeys = {
  list: () => ["spaces", "list"] as const,
  members: (spaceId: string) => ["spaces", spaceId, "members"] as const,
  settings: () => ["spaces", "settings"] as const,
  userSearchRoot: (spaceId: string) =>
    ["spaces", spaceId, "user-search"] as const,
  userSearch: (spaceId: string, query: string) =>
    ["spaces", spaceId, "user-search", query] as const,
};

export function useSpaces(repository: SpaceRepository) {
  return useQuery({
    queryFn: () => repository.listSpaces(),
    queryKey: spaceQueryKeys.list(),
  });
}

export function useUserSettings(repository: SpaceRepository) {
  return useQuery({
    queryFn: () => repository.getUserSettings(),
    queryKey: spaceQueryKeys.settings(),
  });
}

export function useSpaceMembers(
  repository: SpaceRepository,
  spaceId: string | null,
  enabled = true,
) {
  return useQuery({
    enabled: enabled && Boolean(spaceId),
    queryFn: () => repository.listSpaceMembers(spaceId ?? ""),
    queryKey: spaceQueryKeys.members(spaceId ?? ""),
  });
}

export function useSpaceUserSearch(
  repository: SpaceRepository,
  spaceId: string | null,
  input: SearchSpaceUsersQuery,
  enabled = true,
) {
  const query = input.query.trim();

  return useQuery({
    enabled: enabled && Boolean(spaceId) && query.length >= 4,
    queryFn: () => repository.searchSpaceUsers(spaceId ?? "", { query }),
    queryKey: spaceQueryKeys.userSearch(spaceId ?? "", query),
  });
}

export function useUpdateDefaultSpace(repository: SpaceRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateDefaultSpaceInput) =>
      repository.updateDefaultSpace(input),
    onSuccess: (settings) => setUserSettingsCache(queryClient, settings),
  });
}

export function useUpdateSpaceCurrency(repository: SpaceRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      spaceId,
    }: {
      input: UpdateSpaceCurrencyInput;
      spaceId: string;
    }) => repository.updateSpaceCurrency(spaceId, input),
    onSuccess: (space) => setSpaceCache(queryClient, space),
  });
}

export function useAddSpaceMember(
  repository: SpaceRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddSpaceMemberInput) =>
      repository.addSpaceMember(spaceId, input),
    onSuccess: (member) => {
      setSpaceMemberCache(queryClient, spaceId, member);
      void invalidateSpaceUserSearchCache(queryClient, spaceId);
    },
  });
}

export function useUpdateSpaceMember(
  repository: SpaceRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      input,
      userId,
    }: {
      input: UpdateSpaceMemberInput;
      userId: string;
    }) => repository.updateSpaceMember(spaceId, userId, input),
    onSuccess: (member) => setSpaceMemberCache(queryClient, spaceId, member),
  });
}

export function useRemoveSpaceMember(
  repository: SpaceRepository,
  spaceId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      repository.removeSpaceMember(spaceId, userId),
    onSuccess: (_, userId) => {
      removeSpaceMemberCache(queryClient, spaceId, userId);
      void invalidateSpaceUserSearchCache(queryClient, spaceId);
    },
  });
}

function setUserSettingsCache(
  queryClient: ReturnType<typeof useQueryClient>,
  settings: UserSettings,
) {
  queryClient.setQueryData(spaceQueryKeys.settings(), settings);
}

function setSpaceCache(
  queryClient: ReturnType<typeof useQueryClient>,
  space: SpaceSummary,
) {
  queryClient.setQueryData(
    spaceQueryKeys.list(),
    (spaces: SpaceSummary[] | undefined) =>
      spaces?.map((item) => (item.id === space.id ? space : item)),
  );
}

function setSpaceMemberCache(
  queryClient: ReturnType<typeof useQueryClient>,
  spaceId: string,
  member: SpaceMember,
) {
  queryClient.setQueryData(
    spaceQueryKeys.members(spaceId),
    (members: SpaceMember[] | undefined) => {
      if (!members) {
        return [member];
      }

      if (members.some((item) => item.userId === member.userId)) {
        return members.map((item) =>
          item.userId === member.userId ? member : item,
        );
      }

      return [...members, member];
    },
  );
}

function removeSpaceMemberCache(
  queryClient: ReturnType<typeof useQueryClient>,
  spaceId: string,
  userId: string,
) {
  queryClient.setQueryData(
    spaceQueryKeys.members(spaceId),
    (members: SpaceMember[] | undefined) =>
      members?.filter((member) => member.userId !== userId),
  );
}

function invalidateSpaceUserSearchCache(
  queryClient: ReturnType<typeof useQueryClient>,
  spaceId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: spaceQueryKeys.userSearchRoot(spaceId),
  });
}
