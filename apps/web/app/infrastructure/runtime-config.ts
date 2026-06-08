export function getConfiguredLoginFallbackUrl(): string {
  const env = import.meta.env as
    | { VITE_LOGIN_FALLBACK_URL?: string }
    | undefined;

  return (
    normalizeOptionalUrl(env?.VITE_LOGIN_FALLBACK_URL) ??
    "http://localhost:5173/login?app=family-fi"
  );
}

export function getConfiguredLoginErrorFallbackUrl(): string {
  return withAuthErrorParam(getConfiguredLoginFallbackUrl());
}

function normalizeOptionalUrl(value: string | undefined): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function withAuthErrorParam(value: string): string {
  try {
    const url = new URL(value);
    url.searchParams.set("auth_error", "1");

    return url.toString();
  } catch {
    return value;
  }
}
