import {
  createLanguagePreference,
  parseSupportedLanguage,
  resolveSupportedBrowserLanguage,
} from "../domain/language-preference";
import type { LanguagePreferenceRepository } from "../domain/language-preference-repository";

export function readLanguagePreference(
  repository: LanguagePreferenceRepository,
) {
  const browserLanguage = resolveSupportedBrowserLanguage(
    repository.getBrowserLanguageTags(),
  );
  const explicitLanguage = parseSupportedLanguage(
    repository.getExplicitLanguage(),
  );

  return createLanguagePreference({
    browserLanguage,
    explicitLanguage,
  });
}
