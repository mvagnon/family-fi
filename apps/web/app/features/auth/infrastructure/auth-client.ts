import { createAuthClient } from "better-auth/react";

import { getConfiguredApiBaseUrl } from "~/infrastructure/api-client";
import type { AuthRepository } from "../domain/auth-repository";

const betterAuthClient = createAuthClient({
  baseURL: getConfiguredApiBaseUrl(),
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
  async signInWithEmail(input) {
    const result = await betterAuthClient.signIn.email({
      email: input.email,
      password: input.password,
    });

    if (result.error) {
      throw new Error(result.error.message ?? "Invalid email or password.");
    }
  },
  async signOut() {
    const result = await betterAuthClient.signOut();

    if (result.error) {
      throw new Error(result.error.message ?? "Sign out failed.");
    }
  },
};
