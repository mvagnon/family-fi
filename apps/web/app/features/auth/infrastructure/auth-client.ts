import { createAuthClient } from "better-auth/react";

import { getConfiguredApiBaseUrl } from "~/infrastructure/api-client";

export const authClient = createAuthClient({
  baseURL: getConfiguredApiBaseUrl(),
  fetchOptions: {
    credentials: "include",
  },
});
