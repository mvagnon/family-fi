export const defaultLanguage = "en";
export const supportedLanguages = ["en", "fr", "ja"] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

const supportedLanguageSet = new Set<string>(supportedLanguages);

export function isSupportedLanguage(
  language: string,
): language is SupportedLanguage {
  return supportedLanguageSet.has(language);
}
