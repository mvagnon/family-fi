import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { useActiveSpace } from "../../spaces/presentation/active-space-provider";

type HiddenIdsBySpaceId = Record<string, string[]>;

interface FamilyVisibilityContextValue {
  hiddenLoanIds: ReadonlySet<string>;
  hiddenMemberIds: ReadonlySet<string>;
  isLoanVisible: (loanId: string) => boolean;
  isMemberVisible: (memberId: string) => boolean;
  toggleLoanVisibility: (loanId: string) => void;
  toggleMemberVisibility: (memberId: string) => void;
}

interface FamilyMemberVisibilityProviderProps {
  children: ReactNode;
}

const FamilyVisibilityContext =
  createContext<FamilyVisibilityContextValue | null>(null);

export function FamilyMemberVisibilityProvider({
  children,
}: FamilyMemberVisibilityProviderProps) {
  const { activeSpaceId } = useActiveSpace();
  const [hiddenMemberIdsBySpaceId, setHiddenMemberIdsBySpaceId] =
    useState<HiddenIdsBySpaceId>({});
  const [hiddenLoanIdsBySpaceId, setHiddenLoanIdsBySpaceId] =
    useState<HiddenIdsBySpaceId>({});
  const hiddenMemberIds = useMemo(
    () =>
      new Set(
        activeSpaceId ? (hiddenMemberIdsBySpaceId[activeSpaceId] ?? []) : [],
      ),
    [activeSpaceId, hiddenMemberIdsBySpaceId],
  );
  const hiddenLoanIds = useMemo(
    () =>
      new Set(
        activeSpaceId ? (hiddenLoanIdsBySpaceId[activeSpaceId] ?? []) : [],
      ),
    [activeSpaceId, hiddenLoanIdsBySpaceId],
  );
  const isMemberVisible = useCallback(
    (memberId: string) => !hiddenMemberIds.has(memberId),
    [hiddenMemberIds],
  );
  const isLoanVisible = useCallback(
    (loanId: string) => !hiddenLoanIds.has(loanId),
    [hiddenLoanIds],
  );
  const toggleMemberVisibility = useCallback(
    (memberId: string) => {
      if (!activeSpaceId) {
        return;
      }

      setHiddenMemberIdsBySpaceId((current) =>
        toggleHiddenId(current, activeSpaceId, memberId),
      );
    },
    [activeSpaceId],
  );
  const toggleLoanVisibility = useCallback(
    (loanId: string) => {
      if (!activeSpaceId) {
        return;
      }

      setHiddenLoanIdsBySpaceId((current) =>
        toggleHiddenId(current, activeSpaceId, loanId),
      );
    },
    [activeSpaceId],
  );
  const value = useMemo<FamilyVisibilityContextValue>(
    () => ({
      hiddenLoanIds,
      hiddenMemberIds,
      isLoanVisible,
      isMemberVisible,
      toggleLoanVisibility,
      toggleMemberVisibility,
    }),
    [
      hiddenLoanIds,
      hiddenMemberIds,
      isLoanVisible,
      isMemberVisible,
      toggleLoanVisibility,
      toggleMemberVisibility,
    ],
  );

  return (
    <FamilyVisibilityContext.Provider value={value}>
      {children}
    </FamilyVisibilityContext.Provider>
  );
}

export function useFamilyVisibility() {
  const context = useContext(FamilyVisibilityContext);

  if (!context) {
    throw new Error(
      "useFamilyVisibility must be used inside FamilyMemberVisibilityProvider.",
    );
  }

  return context;
}

export function useFamilyMemberVisibility() {
  return useFamilyVisibility();
}

function toggleHiddenId(
  current: HiddenIdsBySpaceId,
  activeSpaceId: string,
  itemId: string,
): HiddenIdsBySpaceId {
  const currentItemIds = current[activeSpaceId] ?? [];
  const nextItemIds = currentItemIds.includes(itemId)
    ? currentItemIds.filter((item) => item !== itemId)
    : [...currentItemIds, itemId];

  return {
    ...current,
    [activeSpaceId]: nextItemIds,
  };
}
