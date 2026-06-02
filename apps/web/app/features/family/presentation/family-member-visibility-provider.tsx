import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useActiveSpace } from "../../spaces/presentation/active-space-provider";

interface FamilyMemberVisibilityContextValue {
  hiddenMemberIds: ReadonlySet<string>;
  isMemberVisible: (memberId: string) => boolean;
  toggleMemberVisibility: (memberId: string) => void;
}

interface FamilyMemberVisibilityProviderProps {
  children: ReactNode;
}

const FamilyMemberVisibilityContext =
  createContext<FamilyMemberVisibilityContextValue | null>(null);

export function FamilyMemberVisibilityProvider({
  children,
}: FamilyMemberVisibilityProviderProps) {
  const { activeSpaceId } = useActiveSpace();
  const [hiddenMemberIdsBySpaceId, setHiddenMemberIdsBySpaceId] = useState<
    Record<string, string[]>
  >({});
  const hiddenMemberIds = useMemo(
    () =>
      new Set(
        activeSpaceId ? (hiddenMemberIdsBySpaceId[activeSpaceId] ?? []) : [],
      ),
    [activeSpaceId, hiddenMemberIdsBySpaceId],
  );
  const isMemberVisible = useCallback(
    (memberId: string) => !hiddenMemberIds.has(memberId),
    [hiddenMemberIds],
  );
  const toggleMemberVisibility = useCallback(
    (memberId: string) => {
      if (!activeSpaceId) {
        return;
      }

      setHiddenMemberIdsBySpaceId((current) => {
        const currentMemberIds = current[activeSpaceId] ?? [];
        const nextMemberIds = currentMemberIds.includes(memberId)
          ? currentMemberIds.filter((item) => item !== memberId)
          : [...currentMemberIds, memberId];

        return {
          ...current,
          [activeSpaceId]: nextMemberIds,
        };
      });
    },
    [activeSpaceId],
  );
  const value = useMemo<FamilyMemberVisibilityContextValue>(
    () => ({
      hiddenMemberIds,
      isMemberVisible,
      toggleMemberVisibility,
    }),
    [hiddenMemberIds, isMemberVisible, toggleMemberVisibility],
  );

  return (
    <FamilyMemberVisibilityContext.Provider value={value}>
      {children}
    </FamilyMemberVisibilityContext.Provider>
  );
}

export function useFamilyMemberVisibility() {
  const context = useContext(FamilyMemberVisibilityContext);

  if (!context) {
    throw new Error(
      "useFamilyMemberVisibility must be used inside FamilyMemberVisibilityProvider.",
    );
  }

  return context;
}
