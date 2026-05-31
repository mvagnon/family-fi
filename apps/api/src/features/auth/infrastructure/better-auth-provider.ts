import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import type { PrismaClient } from "../../../generated/prisma/client.js";
import type { AuthProvider } from "../domain/auth.js";

interface BetterAuthProviderOptions {
  baseUrl: string;
  secret: string;
  trustedOrigins: string[];
}

export function createBetterAuthProvider(
  prisma: PrismaClient,
  options: BetterAuthProviderOptions,
): AuthProvider {
  const auth = betterAuth({
    baseURL: options.baseUrl,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      disableSignUp: true,
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 8,
    },
    secret: options.secret,
    trustedOrigins: options.trustedOrigins,
  });

  return {
    async getSession(request) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return null;
      }

      return {
        user: {
          email: session.user.email,
          id: session.user.id,
          name: session.user.name,
        },
      };
    },
    handleRequest: (request) => auth.handler(request),
  };
}
