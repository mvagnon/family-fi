export function getConfiguredLoginFallbackUrl(): string {
  const env = import.meta.env as
    | { VITE_LOGIN_FALLBACK_URL?: string }
    | undefined;

  return (
    normalizeOptionalHttpUrl(env?.VITE_LOGIN_FALLBACK_URL) ??
    "http://localhost:5173/login?app=family-fi"
  );
}

export function getConfiguredLoginErrorFallbackUrl(): string {
  return withAuthErrorParam(getConfiguredLoginFallbackUrl());
}

export function normalizeApiBaseUrl(value: string): string {
  return normalizeHttpUrl(value).replace(/\/$/, "");
}

export function normalizeHttpUrl(value: string): string {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    throw new Error("URL value cannot be empty.");
  }

  const url = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  new URL(url);

  return url;
}

function normalizeOptionalHttpUrl(value: string | undefined): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? normalizeHttpUrl(trimmedValue) : null;
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
