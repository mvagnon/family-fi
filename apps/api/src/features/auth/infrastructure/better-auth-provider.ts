import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";

import type { PrismaClient } from "../../../generated/prisma/client.js";
import { ensureUserIsProvisioned } from "../application/provision-user.js";
import type { AuthSession } from "../domain/auth.js";

interface BetterAuthProviderOptions {
  baseUrl: string;
  hubOrigin: string;
  ikiOAuthAuthorizationUrl?: string;
  ikiOAuthClientId: string;
  ikiOAuthClientSecret: string;
  ikiOAuthDiscoveryUrl?: string;
  ikiOAuthIssuer?: string;
  ikiOAuthTokenUrl?: string;
  ikiOAuthUserInfoUrl?: string;
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
    plugins: [
      genericOAuth({
        config: [
          {
            authorizationUrl: options.ikiOAuthAuthorizationUrl,
            clientId: options.ikiOAuthClientId,
            clientSecret: options.ikiOAuthClientSecret,
            discoveryUrl: options.ikiOAuthDiscoveryUrl,
            issuer: options.ikiOAuthIssuer,
            pkce: true,
            providerId: "iki",
            redirectURI: `${options.baseUrl}/api/auth/oauth2/callback/iki`,
            requireIssuerValidation: true,
            scopes: ["openid", "profile", "email"],
            tokenUrl: options.ikiOAuthTokenUrl,
            overrideUserInfo: true,
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

      const ikiUserId = await syncIkiUserProfile(prisma, {
        email: session.user.email,
        id: session.user.id,
        name: session.user.name,
      });

      await ensureUserIsProvisioned(prisma, {
        id: session.user.id,
        ikiUserId,
      });

      return {
        user: {
          email: session.user.email,
          id: session.user.id,
          ikiUserId,
          name: session.user.name,
        },
      };
    },
    handleAuthRequest: (request) => auth.handler(request),
  };
}

async function syncIkiUserProfile(
  prisma: PrismaClient,
  user: {
    email: string;
    id: string;
    name: string;
  },
): Promise<string> {
  const ikiAccount = await prisma.account.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      accountId: true,
    },
    where: {
      providerId: "iki",
      userId: user.id,
    },
  });

  if (!ikiAccount) {
    throw new Error("Authenticated user is missing an Iki account link.");
  }

  await prisma.user.update({
    data: {
      email: user.email,
      ikiUserId: ikiAccount.accountId,
      name: user.name,
    },
    where: {
      id: user.id,
    },
  });

  return ikiAccount.accountId;
}
