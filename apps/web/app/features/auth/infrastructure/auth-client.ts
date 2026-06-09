import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

import { getConfiguredApiBaseUrl } from "~/infrastructure/api-client";
import {
  getConfiguredLoginErrorFallbackUrl,
  normalizeApiBaseUrl,
} from "~/infrastructure/runtime-config";
import type { AuthRepository } from "../domain/auth-repository";

const betterAuthClient = createAuthClient({
  baseURL: getConfiguredApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
  plugins: [genericOAuthClient()],
});

const hubAuthClient = createAuthClient({
  baseURL: getConfiguredHubApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});

export const authClient: AuthRepository = {
  async getSession() {
    const result = await betterAuthClient.getSession();

    if (result.error) {
      if (result.error.status === 401) {
        return null;
      }

      throw new Error(result.error.message ?? "Session could not be loaded.");
    }

    return result.data?.user ?? null;
  },
  async signInWithHub() {
    const result = await betterAuthClient.signIn.oauth2({
      callbackURL: getAppCallbackUrl(),
      disableRedirect: true,
      errorCallbackURL: getConfiguredLoginErrorFallbackUrl(),
      providerId: "iki",
      scopes: ["openid", "profile", "email"],
    });

    if (result.error) {
      throw new Error(result.error.message ?? "Sign in failed.");
    }

    const redirectUrl = getRedirectUrl(result.data);

    if (!redirectUrl) {
      throw new Error("Sign in redirect could not be started.");
    }

    window.location.assign(redirectUrl);
  },
  async signOut() {
    const result = await betterAuthClient.signOut();

    if (result.error) {
      throw new Error(result.error.message ?? "Sign out failed.");
    }

    const hubResult = await hubAuthClient.signOut();

    if (hubResult.error) {
      throw new Error(hubResult.error.message ?? "Sign out failed.");
    }
  },
};

function getAppCallbackUrl(): string {
  return new URL("/family", window.location.origin).toString();
}

function getConfiguredHubApiBaseUrl(): string {
  const env = import.meta.env as { VITE_HUB_API_BASE_URL?: string } | undefined;

  return normalizeApiBaseUrl(
    env?.VITE_HUB_API_BASE_URL ?? "http://localhost:3000",
  );
}

function getRedirectUrl(value: unknown): string | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.url === "string") {
    return value.url;
  }

  if (typeof value.redirectTo === "string") {
    return value.redirectTo;
  }

  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
