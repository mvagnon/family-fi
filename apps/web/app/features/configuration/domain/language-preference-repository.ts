import type { SupportedLanguage } from "./supported-language";

export interface LanguagePreferenceRepository {
  clearExplicitLanguage(): void;
  getBrowserLanguageTags(): readonly string[];
  getExplicitLanguage(): string | null;
  setExplicitLanguage(language: SupportedLanguage): void;
}
