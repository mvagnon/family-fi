import type { Context } from "hono";

import type { AuthenticatedUser, AuthSession } from "../../domain/auth.js";
import { UnauthenticatedError } from "../../domain/auth.js";

export interface AuthSessionReader {
  getSession(request: Request): Promise<AuthSession | null>;
}

export async function getAuthenticatedUser(
  context: Context,
  authProvider: AuthSessionReader,
): Promise<AuthenticatedUser> {
  const session = await authProvider.getSession(context.req.raw);

  if (!session) {
    throw new UnauthenticatedError();
  }

  return session.user;
}
