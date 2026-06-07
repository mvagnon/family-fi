import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SpaceRepository } from "../domain/space-repository";
import type {
  SpaceSummary,
  UpdateDefaultSpaceInput,
  UpdateSpaceCurrencyInput,
  UserSettings,
} from "../domain/spaces";

export const spaceQueryKeys = {
  list: () => ["spaces", "list"] as const,
  settings: () => ["spaces", "settings"] as const,
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
