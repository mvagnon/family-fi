import type { Context } from "hono";

import type { AuthenticatedUser, AuthProvider } from "../../domain/auth.js";
import { UnauthenticatedError } from "../../domain/auth.js";

export async function getAuthenticatedUser(
  context: Context,
  authProvider: AuthProvider,
): Promise<AuthenticatedUser> {
  const session = await authProvider.getSession(context.req.raw);

  if (!session) {
    throw new UnauthenticatedError();
  }

  return session.user;
}
