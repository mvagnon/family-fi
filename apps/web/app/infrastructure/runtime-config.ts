export function getConfiguredLoginFallbackUrl(): string {
  const env = import.meta.env as
    | { VITE_LOGIN_FALLBACK_URL?: string }
    | undefined;

  return (
    normalizeOptionalUrl(env?.VITE_LOGIN_FALLBACK_URL) ??
    "http://localhost:5173/login"
  );
}

function normalizeOptionalUrl(value: string | undefined): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}
