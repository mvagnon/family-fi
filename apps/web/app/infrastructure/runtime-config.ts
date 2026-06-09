import { normalizeHttpOrigin, normalizeHttpUrl } from "./http-url";

export function getConfiguredLoginFallbackUrl(): string {
  const env = import.meta.env as
    | {
        VITE_HUB_API_BASE_URL?: string;
        VITE_HUB_ORIGIN?: string;
        VITE_LOGIN_FALLBACK_URL?: string;
      }
    | undefined;
  const hubOrigin = normalizeHttpOrigin(
    env?.VITE_HUB_ORIGIN?.trim() ||
      getOriginFromUrl(env?.VITE_LOGIN_FALLBACK_URL) ||
      env?.VITE_HUB_API_BASE_URL?.trim() ||
      "http://localhost:5173",
  );
  const url = new URL("/login", hubOrigin);

  url.searchParams.set("app", "family-fi");

  return url.toString();
}

export function getConfiguredLoginErrorFallbackUrl(): string {
  return withAuthErrorParam(getConfiguredLoginFallbackUrl());
}

export function normalizeApiBaseUrl(value: string): string {
  return normalizeHttpOrigin(value);
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

function getOriginFromUrl(value: string | undefined): string {
  if (!value?.trim()) {
    return "";
  }

  return new URL(normalizeHttpUrl(value)).origin;
}
