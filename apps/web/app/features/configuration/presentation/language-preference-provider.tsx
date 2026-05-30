import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { readLanguagePreference } from "../application/language-preference-state";
import {
  createLanguagePreference,
  type LanguagePreference,
} from "../domain/language-preference";
import type { LanguagePreferenceRepository } from "../domain/language-preference-repository";
import {
  defaultLanguage,
  type SupportedLanguage,
} from "../domain/supported-language";

interface LanguagePreferenceContextValue extends LanguagePreference {
  hasExplicitLanguage: boolean;
  resetLanguage(): void;
  setLanguage(language: SupportedLanguage): void;
}

interface LanguagePreferenceProviderProps {
  children: ReactNode;
  onLanguageChange: (language: SupportedLanguage) => void;
  repository: LanguagePreferenceRepository;
}

const LanguagePreferenceContext =
  createContext<LanguagePreferenceContextValue | null>(null);

export function LanguagePreferenceProvider({
  children,
  onLanguageChange,
  repository,
}: LanguagePreferenceProviderProps) {
  const [preference, setPreference] = useState(() =>
    createLanguagePreference({
      browserLanguage: defaultLanguage,
      explicitLanguage: null,
    }),
  );

  useEffect(() => {
    setPreference(readLanguagePreference(repository));
  }, [repository]);

  useEffect(() => {
    onLanguageChange(preference.activeLanguage);
  }, [onLanguageChange, preference.activeLanguage]);

  const setLanguage = useCallback(
    (language: SupportedLanguage) => {
      repository.setExplicitLanguage(language);
      setPreference(readLanguagePreference(repository));
    },
    [repository],
  );

  const resetLanguage = useCallback(() => {
    repository.clearExplicitLanguage();
    setPreference(readLanguagePreference(repository));
  }, [repository]);

  const value = useMemo<LanguagePreferenceContextValue>(
    () => ({
      ...preference,
      hasExplicitLanguage: preference.explicitLanguage !== null,
      resetLanguage,
      setLanguage,
    }),
    [preference, resetLanguage, setLanguage],
  );

  return (
    <LanguagePreferenceContext.Provider value={value}>
      {children}
    </LanguagePreferenceContext.Provider>
  );
}

export function useLanguagePreference() {
  const context = useContext(LanguagePreferenceContext);

  if (!context) {
    throw new Error(
      "useLanguagePreference must be used within LanguagePreferenceProvider.",
    );
  }

  return context;
}
