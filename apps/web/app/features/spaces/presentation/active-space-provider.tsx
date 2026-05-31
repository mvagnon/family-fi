import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  hasAccessibleSpace,
  resolveActiveSpaceId,
} from "../application/active-space";
import { useSpaces, useUserSettings } from "../application/space-queries";
import type { SpaceRepository } from "../domain/space-repository";
import type { SpaceSummary } from "../domain/spaces";

interface ActiveSpaceProviderProps {
  children: ReactNode;
  repository: SpaceRepository;
}

interface ActiveSpaceContextValue {
  activeSpace: SpaceSummary | null;
  activeSpaceId: string | null;
  defaultSpaceId: string | null;
  error: Error | null;
  isFetching: boolean;
  isPending: boolean;
  refetch: () => void;
  selectSpace: (spaceId: string) => void;
  spaces: SpaceSummary[];
}

const ActiveSpaceContext = createContext<ActiveSpaceContextValue | null>(null);

export function ActiveSpaceProvider({
  children,
  repository,
}: ActiveSpaceProviderProps) {
  const spacesQuery = useSpaces(repository);
  const settingsQuery = useUserSettings(repository);
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);

  const spaces = spacesQuery.data ?? [];
  const settings = settingsQuery.data ?? null;
  const resolvedActiveSpaceId = useMemo(
    () =>
      resolveActiveSpaceId({
        activeSpaceId,
        settings,
        spaces,
      }),
    [activeSpaceId, settings, spaces],
  );

  useEffect(() => {
    if (activeSpaceId !== resolvedActiveSpaceId) {
      setActiveSpaceId(resolvedActiveSpaceId);
    }
  }, [activeSpaceId, resolvedActiveSpaceId]);

  const selectSpace = useCallback(
    (spaceId: string) => {
      if (hasAccessibleSpace(spaces, spaceId)) {
        setActiveSpaceId(spaceId);
      }
    },
    [spaces],
  );

  const refetch = useCallback(() => {
    void spacesQuery.refetch();
    void settingsQuery.refetch();
  }, [settingsQuery, spacesQuery]);

  const value = useMemo<ActiveSpaceContextValue>(() => {
    const activeSpace =
      spaces.find((space) => space.id === resolvedActiveSpaceId) ?? null;

    return {
      activeSpace,
      activeSpaceId: resolvedActiveSpaceId,
      defaultSpaceId: settings?.defaultSpaceId ?? null,
      error: spacesQuery.error ?? settingsQuery.error ?? null,
      isFetching: spacesQuery.isFetching || settingsQuery.isFetching,
      isPending: spacesQuery.isPending || settingsQuery.isPending,
      refetch,
      selectSpace,
      spaces,
    };
  }, [
    refetch,
    resolvedActiveSpaceId,
    selectSpace,
    settings?.defaultSpaceId,
    settingsQuery.error,
    settingsQuery.isFetching,
    settingsQuery.isPending,
    spaces,
    spacesQuery.error,
    spacesQuery.isFetching,
    spacesQuery.isPending,
  ]);

  return (
    <ActiveSpaceContext.Provider value={value}>
      {children}
    </ActiveSpaceContext.Provider>
  );
}

export function useActiveSpace() {
  const context = useContext(ActiveSpaceContext);

  if (!context) {
    throw new Error("useActiveSpace must be used inside ActiveSpaceProvider.");
  }

  return context;
}
