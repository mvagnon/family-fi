import {
  fetchWithCredentials,
  getConfiguredApiBaseUrl,
} from "~/infrastructure/api-client";
import {
  getConfiguredLoginErrorFallbackUrl,
  getConfiguredLoginFallbackUrl,
  normalizeApiBaseUrl,
} from "~/infrastructure/runtime-config";
import type { AuthUser } from "../domain/auth";
import type { AuthRepository } from "../domain/auth-repository";

export const authClient: AuthRepository = {
  async getSession() {
    const response = await fetchWithCredentials(
      createApiUrl("/api/auth/get-session"),
    );

    if (!response.ok) {
      throw new Error("Session could not be loaded.");
    }

    return parseSessionPayload(await response.json());
  },
  async signInWithHub() {
    const redirectUrl = createApiUrl("/api/auth/iki/start");
    redirectUrl.searchParams.set("callbackURL", getAppCallbackUrl());
    redirectUrl.searchParams.set(
      "errorCallbackURL",
      getConfiguredLoginErrorFallbackUrl(),
    );

    window.location.assign(redirectUrl.toString());
  },
  async signOut() {
    await postSignOut(createApiUrl("/api/auth/sign-out"));

    await postSignOut(createHubApiUrl("/api/auth/sign-out"));
  },
};

function getAppCallbackUrl(): string {
  return new URL("/family", window.location.origin).toString();
}

function getConfiguredHubApiBaseUrl(): string {
  return normalizeApiBaseUrl(getConfiguredLoginFallbackUrl());
}

function createApiUrl(path: string): URL {
  return new URL(path, getConfiguredApiBaseUrl());
}

function createHubApiUrl(path: string): URL {
  return new URL(path, getConfiguredHubApiBaseUrl());
}

async function postSignOut(url: URL): Promise<void> {
  const response = await fetchWithCredentials(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Sign out failed.");
  }
}

function parseSessionPayload(value: unknown): AuthUser | null {
  if (value === null) {
    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  const user = isRecord(value.user) ? value.user : value;
  const id = getString(user, "id");
  const email = getString(user, "email");
  const name = getString(user, "name");

  if (!id || !email || !name) {
    return null;
  }

  return {
    email,
    id,
    image: getOptionalString(user, "image"),
    name,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: Record<string, unknown>, key: string): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function getOptionalString(
  value: Record<string, unknown>,
  key: string,
): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}
