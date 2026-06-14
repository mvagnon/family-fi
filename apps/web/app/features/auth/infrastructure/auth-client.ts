import {
  fetchWithCredentials,
  getConfiguredApiBaseUrl,
} from "~/infrastructure/api-client";
import type { AuthUser } from "../domain/auth";
import type { AuthRepository } from "../domain/auth-repository";

export const authClient: AuthRepository = {
  async getSession() {
    const response = await fetchWithCredentials(
      createApiUrl("/api/auth/session"),
    );

    if (!response.ok) {
      throw new Error("Session could not be loaded.");
    }

    return parseSessionPayload(await response.json());
  },
  async signInWithLogto() {
    window.location.assign(createApiUrl("/api/auth/login").toString());
  },
  async signOut() {
    return postSignOut(createApiUrl("/api/auth/sign-out"));
  },
};

function createApiUrl(path: string): URL {
  return new URL(path, getConfiguredApiBaseUrl());
}

async function postSignOut(url: URL): Promise<string> {
  const response = await fetchWithCredentials(url, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Sign out failed.");
  }

  return parseSignOutPayload(await response.json());
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

function parseSignOutPayload(value: unknown): string {
  if (!isRecord(value)) {
    throw new Error("Sign out response is invalid.");
  }

  const redirectUrl = getString(value, "redirectUrl");

  if (!redirectUrl) {
    throw new Error("Sign out response is missing redirectUrl.");
  }

  return redirectUrl;
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
