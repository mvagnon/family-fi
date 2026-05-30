import type { LanguagePreferenceRepository } from "../domain/language-preference-repository";
import type { SupportedLanguage } from "../domain/supported-language";

const LANGUAGE_STORAGE_KEY = "family-fi.language";

export const browserLanguagePreferenceRepository: LanguagePreferenceRepository =
  {
    clearExplicitLanguage() {
      if (typeof window === "undefined") {
        return;
      }

      removeLocalStorageValue(LANGUAGE_STORAGE_KEY);
    },
    getBrowserLanguageTags() {
      if (typeof navigator === "undefined") {
        return [];
      }

      if (navigator.languages.length > 0) {
        return [...navigator.languages];
      }

      return navigator.language ? [navigator.language] : [];
    },
    getExplicitLanguage() {
      if (typeof window === "undefined") {
        return null;
      }

      return readLocalStorageValue(LANGUAGE_STORAGE_KEY);
    },
    setExplicitLanguage(language: SupportedLanguage) {
      if (typeof window === "undefined") {
        return;
      }

      writeLocalStorageValue(LANGUAGE_STORAGE_KEY, language);
    },
  };

function readLocalStorageValue(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorageValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function removeLocalStorageValue(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}
