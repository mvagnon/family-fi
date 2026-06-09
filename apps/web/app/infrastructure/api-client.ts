import { normalizeApiBaseUrl } from "./runtime-config";

export { normalizeApiBaseUrl };

export function getConfiguredApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return normalizeApiBaseUrl(
    getRuntimeEnv("WEB_ORIGIN") ??
      getRuntimeEnv("RAILWAY_PUBLIC_DOMAIN") ??
      "http://localhost:5174",
  );
}

export const fetchWithCredentials: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
  });
};

function getRuntimeEnv(name: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[name]?.trim() || undefined;
}
