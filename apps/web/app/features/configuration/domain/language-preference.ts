import {
  defaultLanguage,
  isSupportedLanguage,
  type SupportedLanguage,
} from "./supported-language";

export type LanguagePreferenceSource = "browser" | "explicit";

export interface LanguagePreference {
  activeLanguage: SupportedLanguage;
  browserLanguage: SupportedLanguage;
  explicitLanguage: SupportedLanguage | null;
  source: LanguagePreferenceSource;
}

interface CreateLanguagePreferenceInput {
  browserLanguage: SupportedLanguage;
  explicitLanguage: SupportedLanguage | null;
}

export function createLanguagePreference({
  browserLanguage,
  explicitLanguage,
}: CreateLanguagePreferenceInput): LanguagePreference {
  return {
    activeLanguage: explicitLanguage ?? browserLanguage,
    browserLanguage,
    explicitLanguage,
    source: explicitLanguage ? "explicit" : "browser",
  };
}

export function normalizeLanguageTag(languageTag: string): string {
  return languageTag.trim().toLowerCase().replace("_", "-").split("-")[0];
}

export function parseSupportedLanguage(
  language: string | null | undefined,
): SupportedLanguage | null {
  if (!language) {
    return null;
  }

  const normalizedLanguage = normalizeLanguageTag(language);

  return isSupportedLanguage(normalizedLanguage) ? normalizedLanguage : null;
}

export function resolveSupportedBrowserLanguage(
  languageTags: readonly string[],
): SupportedLanguage {
  for (const languageTag of languageTags) {
    const language = parseSupportedLanguage(languageTag);

    if (language) {
      return language;
    }
  }

  return defaultLanguage;
}
