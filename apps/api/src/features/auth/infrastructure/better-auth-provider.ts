import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";

import type { PrismaClient } from "../../../generated/prisma/client.js";
import { ensureUserIsProvisioned } from "../application/provision-user.js";
import type { AuthSession } from "../domain/auth.js";

interface BetterAuthProviderOptions {
  baseUrl: string;
  hubOrigin: string;
  ikiOAuthAuthorizationUrl: string;
  ikiOAuthClientId: string;
  ikiOAuthClientSecret: string;
  ikiOAuthIssuer: string;
  ikiOAuthTokenUrl: string;
  ikiOAuthUserInfoUrl: string;
  secret: string;
  trustedOrigins: string[];
}

export interface AuthHttpAdapter {
  getSession(request: Request): Promise<AuthSession | null>;
  handleAuthRequest(request: Request): Promise<Response> | Response;
}

export function createBetterAuthProvider(
  prisma: PrismaClient,
  options: BetterAuthProviderOptions,
): AuthHttpAdapter {
  const auth = betterAuth({
    baseURL: options.baseUrl,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await ensureUserIsProvisioned(prisma, user);
          },
        },
      },
    },
    plugins: [
      genericOAuth({
        config: [
          {
            authorizationUrl: options.ikiOAuthAuthorizationUrl,
            clientId: options.ikiOAuthClientId,
            clientSecret: options.ikiOAuthClientSecret,
            issuer: options.ikiOAuthIssuer,
            pkce: true,
            providerId: "iki",
            redirectURI: `${options.baseUrl}/api/auth/oauth2/callback/iki`,
            requireIssuerValidation: true,
            scopes: ["openid", "profile", "email"],
            tokenUrl: options.ikiOAuthTokenUrl,
            userInfoUrl: options.ikiOAuthUserInfoUrl,
          },
        ],
      }),
    ],
    secret: options.secret,
    trustedOrigins: [...options.trustedOrigins, options.hubOrigin],
  });

  return {
    async getSession(request) {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return null;
      }

      await ensureUserIsProvisioned(prisma, session.user);

      return {
        user: {
          email: session.user.email,
          id: session.user.id,
          name: session.user.name,
        },
      };
    },
    handleAuthRequest: (request) => auth.handler(request),
  };
}
