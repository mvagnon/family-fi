export function getConfiguredApiBaseUrl(): string {
  const env = import.meta.env as { VITE_API_BASE_URL?: string } | undefined;

  return env?.VITE_API_BASE_URL ?? "http://localhost:3001";
}

export function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

export const fetchWithCredentials: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    credentials: init?.credentials ?? "include",
  });
};
