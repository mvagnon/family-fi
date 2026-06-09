import { createHash, randomBytes, randomUUID } from "node:crypto";

import type { PrismaClient } from "../../../generated/prisma/client.js";
import { ensureUserIsProvisioned } from "../application/provision-user.js";
import type { AuthSession } from "../domain/auth.js";

interface OAuthAuthProviderOptions {
  baseUrl: string;
  hubOrigin: string;
  ikiOAuthAuthorizationUrl?: string;
  ikiOAuthClientId: string;
  ikiOAuthClientSecret: string;
  ikiOAuthDiscoveryUrl?: string;
  ikiOAuthIssuer?: string;
  ikiOAuthTokenUrl?: string;
  ikiOAuthUserInfoUrl?: string;
  trustedOrigins: string[];
}

interface OAuthMetadata {
  authorizationUrl: string;
  issuer?: string;
  tokenUrl: string;
  userInfoUrl: string;
}

interface IkiUserInfo {
  email: string;
  emailVerified: boolean;
  image: string | null;
  name: string;
  sub: string;
}

interface TokenResponse {
  accessToken: string;
  expiresAt: Date | null;
  idToken: string | null;
  refreshToken: string | null;
  refreshTokenExpiresAt: Date | null;
  scope: string | null;
}

export interface AuthHttpAdapter {
  getSession(request: Request): Promise<AuthSession | null>;
  handleAuthRequest(request: Request): Promise<Response> | Response;
}

const SESSION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_COOKIE_NAME = "family-fi.session";
const SECURE_SESSION_COOKIE_NAME = "__Secure-family-fi.session";
const LOGIN_ATTEMPT_TTL_MS = 5 * 60 * 1000;

export function createOAuthAuthProvider(
  prisma: PrismaClient,
  options: OAuthAuthProviderOptions,
): AuthHttpAdapter {
  const metadata = createOAuthMetadataResolver(options);
  const baseUrl = new URL(options.baseUrl);
  const redirectUri = new URL(
    "/api/auth/oauth2/callback/iki",
    baseUrl,
  ).toString();
  const defaultCallbackUrl = new URL(
    "/family",
    options.trustedOrigins[0],
  ).toString();
  const defaultErrorCallbackUrl = createDefaultErrorCallbackUrl(
    options.hubOrigin,
  );
  const allowedCallbackOrigins = new Set(options.trustedOrigins);
  const allowedErrorCallbackOrigins = new Set([
    ...options.trustedOrigins,
    options.hubOrigin,
  ]);

  return {
    async getSession(request) {
      const rawSessionToken = getSessionCookie(request, options.baseUrl);

      if (!rawSessionToken) {
        return null;
      }

      const token = hashToken(rawSessionToken);
      const session = await prisma.session.findUnique({
        include: {
          user: true,
        },
        where: {
          token,
        },
      });

      if (!session || session.expiresAt <= new Date()) {
        if (session) {
          await prisma.session.delete({
            where: {
              id: session.id,
            },
          });
        }

        return null;
      }

      if (!session.user.ikiUserId) {
        return null;
      }

      return {
        user: {
          email: session.user.email,
          id: session.user.id,
          ikiUserId: session.user.ikiUserId,
          name: session.user.name,
        },
      };
    },
    async handleAuthRequest(request) {
      const url = new URL(request.url);

      if (request.method === "GET" && url.pathname === "/api/auth/iki/start") {
        try {
          return await startIkiSignIn(prisma, {
            allowedCallbackOrigins,
            allowedErrorCallbackOrigins,
            defaultCallbackUrl,
            defaultErrorCallbackUrl,
            metadata: await metadata(),
            options,
            redirectUri,
            requestUrl: url,
          });
        } catch {
          return redirectResponse(appendAuthError(defaultErrorCallbackUrl));
        }
      }

      if (
        request.method === "GET" &&
        url.pathname === "/api/auth/oauth2/callback/iki"
      ) {
        return handleIkiCallback(prisma, {
          defaultErrorCallbackUrl,
          metadata: await metadata(),
          options,
          redirectUri,
          request,
          requestUrl: url,
        });
      }

      if (
        request.method === "GET" &&
        (url.pathname === "/api/auth/get-session" ||
          url.pathname === "/api/auth/session")
      ) {
        const session = await this.getSession(request);

        return jsonResponse(session);
      }

      if (
        request.method === "POST" &&
        (url.pathname === "/api/auth/sign-out" ||
          url.pathname === "/api/auth/signout")
      ) {
        return signOut(prisma, request, options.baseUrl);
      }

      return jsonResponse({ message: "Not Found" }, 404);
    },
  };
}

async function startIkiSignIn(
  prisma: PrismaClient,
  input: {
    allowedCallbackOrigins: Set<string>;
    allowedErrorCallbackOrigins: Set<string>;
    defaultCallbackUrl: string;
    defaultErrorCallbackUrl: string;
    metadata: OAuthMetadata;
    options: OAuthAuthProviderOptions;
    redirectUri: string;
    requestUrl: URL;
  },
): Promise<Response> {
  await prisma.oAuthLoginAttempt.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  const callbackUrl = getAllowedRedirectUrl(
    input.requestUrl.searchParams.get("callbackURL"),
    input.defaultCallbackUrl,
    input.allowedCallbackOrigins,
  );
  const errorCallbackUrl = getAllowedRedirectUrl(
    input.requestUrl.searchParams.get("errorCallbackURL"),
    input.defaultErrorCallbackUrl,
    input.allowedErrorCallbackOrigins,
  );
  const state = createRandomToken();
  const codeVerifier = createRandomToken();
  const authorizationUrl = new URL(input.metadata.authorizationUrl);

  await prisma.oAuthLoginAttempt.create({
    data: {
      callbackUrl,
      codeVerifier,
      errorCallbackUrl,
      expiresAt: new Date(Date.now() + LOGIN_ATTEMPT_TTL_MS),
      id: randomUUID(),
      state,
    },
  });

  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set(
    "client_id",
    input.options.ikiOAuthClientId,
  );
  authorizationUrl.searchParams.set("redirect_uri", input.redirectUri);
  authorizationUrl.searchParams.set("scope", "openid profile email");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set(
    "code_challenge",
    createCodeChallenge(codeVerifier),
  );
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  return redirectResponse(authorizationUrl.toString());
}

async function handleIkiCallback(
  prisma: PrismaClient,
  input: {
    defaultErrorCallbackUrl: string;
    metadata: OAuthMetadata;
    options: OAuthAuthProviderOptions;
    redirectUri: string;
    request: Request;
    requestUrl: URL;
  },
): Promise<Response> {
  const state = input.requestUrl.searchParams.get("state");
  const error = input.requestUrl.searchParams.get("error");

  if (!state) {
    return redirectResponse(input.defaultErrorCallbackUrl);
  }

  const loginAttempt = await consumeLoginAttempt(prisma, state);
  const errorCallbackUrl =
    loginAttempt?.errorCallbackUrl ?? input.defaultErrorCallbackUrl;

  if (!loginAttempt || error) {
    return redirectResponse(appendAuthError(errorCallbackUrl));
  }

  const code = input.requestUrl.searchParams.get("code");

  if (!code) {
    return redirectResponse(appendAuthError(errorCallbackUrl));
  }

  try {
    const token = await exchangeAuthorizationCode({
      code,
      codeVerifier: loginAttempt.codeVerifier,
      metadata: input.metadata,
      options: input.options,
      redirectUri: input.redirectUri,
    });
    const profile = await fetchIkiUserInfo(input.metadata, token.accessToken);
    const user = await syncAuthenticatedUser(prisma, profile, token);
    const sessionToken = createRandomToken();
    const sessionExpiresAt = new Date(
      Date.now() + SESSION_COOKIE_MAX_AGE_SECONDS * 1000,
    );

    await prisma.session.create({
      data: {
        expiresAt: sessionExpiresAt,
        id: randomUUID(),
        ipAddress: getClientIpAddress(input.request),
        token: hashToken(sessionToken),
        userAgent: input.request.headers.get("user-agent"),
        userId: user.id,
      },
    });

    await ensureUserIsProvisioned(prisma, {
      id: user.id,
      ikiUserId: profile.sub,
    });

    return redirectResponse(loginAttempt.callbackUrl, {
      "Set-Cookie": serializeSessionCookie({
        baseUrl: input.options.baseUrl,
        expiresAt: sessionExpiresAt,
        token: sessionToken,
      }),
    });
  } catch {
    return redirectResponse(appendAuthError(errorCallbackUrl));
  }
}

async function consumeLoginAttempt(prisma: PrismaClient, state: string) {
  return prisma.$transaction(async (transaction) => {
    const loginAttempt = await transaction.oAuthLoginAttempt.findUnique({
      where: {
        state,
      },
    });

    if (!loginAttempt) {
      return null;
    }

    await transaction.oAuthLoginAttempt.delete({
      where: {
        id: loginAttempt.id,
      },
    });

    if (loginAttempt.expiresAt <= new Date()) {
      return null;
    }

    return loginAttempt;
  });
}

async function exchangeAuthorizationCode(input: {
  code: string;
  codeVerifier: string;
  metadata: OAuthMetadata;
  options: OAuthAuthProviderOptions;
  redirectUri: string;
}): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: input.options.ikiOAuthClientId,
    client_secret: input.options.ikiOAuthClientSecret,
    code: input.code,
    code_verifier: input.codeVerifier,
    grant_type: "authorization_code",
    redirect_uri: input.redirectUri,
  });
  const response = await fetch(input.metadata.tokenUrl, {
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Iki token exchange failed.");
  }

  const payload = getRecord(await response.json());
  const accessToken = getString(payload, "access_token");

  return {
    accessToken,
    expiresAt: getExpiresAt(payload, "expires_in"),
    idToken: getOptionalString(payload, "id_token"),
    refreshToken: getOptionalString(payload, "refresh_token"),
    refreshTokenExpiresAt: getExpiresAt(payload, "refresh_token_expires_in"),
    scope: getOptionalString(payload, "scope"),
  };
}

async function fetchIkiUserInfo(
  metadata: OAuthMetadata,
  accessToken: string,
): Promise<IkiUserInfo> {
  const response = await fetch(metadata.userInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Iki user info could not be loaded.");
  }

  const payload = getRecord(await response.json());
  const sub = getString(payload, "sub");
  const email = getString(payload, "email");
  const name = getOptionalString(payload, "name") ?? email;

  return {
    email,
    emailVerified: getOptionalBoolean(payload, "email_verified") ?? false,
    image: getOptionalString(payload, "picture"),
    name,
    sub,
  };
}

async function syncAuthenticatedUser(
  prisma: PrismaClient,
  profile: IkiUserInfo,
  token: TokenResponse,
) {
  return prisma.$transaction(async (transaction) => {
    const existingUser =
      (await transaction.user.findUnique({
        where: {
          ikiUserId: profile.sub,
        },
      })) ??
      (await transaction.user.findUnique({
        where: {
          email: profile.email,
        },
      }));
    const userId = existingUser?.id ?? randomUUID();
    const user = await transaction.user.upsert({
      create: {
        email: profile.email,
        emailVerified: profile.emailVerified,
        id: userId,
        ikiUserId: profile.sub,
        image: profile.image,
        name: profile.name,
      },
      update: {
        email: profile.email,
        emailVerified: profile.emailVerified,
        ikiUserId: profile.sub,
        image: profile.image,
        name: profile.name,
      },
      where: {
        id: userId,
      },
    });
    const existingAccount = await transaction.account.findFirst({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        providerId: "iki",
        userId: user.id,
      },
    });
    const accountData = {
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.expiresAt,
      accountId: profile.sub,
      idToken: token.idToken,
      providerId: "iki",
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      scope: token.scope,
      userId: user.id,
    };

    if (existingAccount) {
      await transaction.account.update({
        data: accountData,
        where: {
          id: existingAccount.id,
        },
      });
    } else {
      await transaction.account.create({
        data: {
          id: randomUUID(),
          ...accountData,
        },
      });
    }

    return user;
  });
}

async function signOut(
  prisma: PrismaClient,
  request: Request,
  baseUrl: string,
): Promise<Response> {
  const rawSessionToken = getSessionCookie(request, baseUrl);

  if (rawSessionToken) {
    await prisma.session.deleteMany({
      where: {
        token: hashToken(rawSessionToken),
      },
    });
  }

  return jsonResponse(null, 200, {
    "Set-Cookie": serializeExpiredSessionCookie(baseUrl),
  });
}

function createOAuthMetadataResolver(
  options: OAuthAuthProviderOptions,
): () => Promise<OAuthMetadata> {
  let cachedMetadata: OAuthMetadata | null = null;

  return async (): Promise<OAuthMetadata> => {
    if (cachedMetadata) {
      return cachedMetadata;
    }

    if (options.ikiOAuthDiscoveryUrl) {
      const response = await fetch(options.ikiOAuthDiscoveryUrl);

      if (!response.ok) {
        throw new Error("Iki OAuth discovery could not be loaded.");
      }

      const payload = getRecord(await response.json());

      const discoveredMetadata: OAuthMetadata = {
        authorizationUrl:
          options.ikiOAuthAuthorizationUrl ??
          getString(payload, "authorization_endpoint"),
        tokenUrl:
          options.ikiOAuthTokenUrl ?? getString(payload, "token_endpoint"),
        userInfoUrl:
          options.ikiOAuthUserInfoUrl ?? getString(payload, "userinfo_endpoint"),
      };
      const issuer = getOptionalString(payload, "issuer");

      if (issuer) {
        discoveredMetadata.issuer = issuer;
      }

      cachedMetadata = discoveredMetadata;

      return cachedMetadata;
    }

    if (
      !options.ikiOAuthAuthorizationUrl ||
      !options.ikiOAuthTokenUrl ||
      !options.ikiOAuthUserInfoUrl
    ) {
      throw new Error("Iki OAuth endpoints are required.");
    }

    cachedMetadata = {
      authorizationUrl: options.ikiOAuthAuthorizationUrl,
      issuer: options.ikiOAuthIssuer,
      tokenUrl: options.ikiOAuthTokenUrl,
      userInfoUrl: options.ikiOAuthUserInfoUrl,
    };

    return cachedMetadata;
  };
}

function getAllowedRedirectUrl(
  value: string | null,
  fallback: string,
  allowedOrigins: Set<string>,
): string {
  if (!value) {
    return fallback;
  }

  const url = new URL(value);

  if (!allowedOrigins.has(url.origin)) {
    throw new Error("Redirect origin is not allowed.");
  }

  return url.toString();
}

function getSessionCookie(request: Request, baseUrl: string): string | null {
  const cookies = parseCookies(request.headers.get("cookie"));
  const secureCookieName = getSessionCookieName(baseUrl);

  return (
    cookies.get(secureCookieName) ??
    cookies.get(SESSION_COOKIE_NAME) ??
    cookies.get(SECURE_SESSION_COOKIE_NAME) ??
    null
  );
}

function parseCookies(value: string | null): Map<string, string> {
  const cookies = new Map<string, string>();

  if (!value) {
    return cookies;
  }

  for (const entry of value.split(";")) {
    const [name, ...rawValue] = entry.trim().split("=");

    if (!name) {
      continue;
    }

    cookies.set(name, decodeURIComponent(rawValue.join("=")));
  }

  return cookies;
}

function serializeSessionCookie(input: {
  baseUrl: string;
  expiresAt: Date;
  token: string;
}): string {
  const isSecure = isHttpsUrl(input.baseUrl);
  const attributes = [
    `${getSessionCookieName(input.baseUrl)}=${encodeURIComponent(input.token)}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${SESSION_COOKIE_MAX_AGE_SECONDS}`,
    `Expires=${input.expiresAt.toUTCString()}`,
    `SameSite=${isSecure ? "None" : "Lax"}`,
  ];

  if (isSecure) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

function serializeExpiredSessionCookie(baseUrl: string): string {
  const isSecure = isHttpsUrl(baseUrl);
  const attributes = [
    `${getSessionCookieName(baseUrl)}=`,
    "Path=/",
    "HttpOnly",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    `SameSite=${isSecure ? "None" : "Lax"}`,
  ];

  if (isSecure) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

function getSessionCookieName(baseUrl: string): string {
  return isHttpsUrl(baseUrl) ? SECURE_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME;
}

function jsonResponse(
  value: unknown,
  status = 200,
  headers: HeadersInit = {},
): Response {
  return Response.json(value, {
    headers,
    status,
  });
}

function redirectResponse(
  location: string,
  headers: HeadersInit = {},
): Response {
  return new Response(null, {
    headers: {
      ...headers,
      Location: location,
    },
    status: 302,
  });
}

function createCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

function createRandomToken(): string {
  return randomBytes(32).toString("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

function createDefaultErrorCallbackUrl(hubOrigin: string): string {
  const url = new URL("/login", hubOrigin);
  url.searchParams.set("app", "family-fi");
  url.searchParams.set("auth_error", "1");

  return url.toString();
}

function appendAuthError(value: string): string {
  const url = new URL(value);
  url.searchParams.set("auth_error", "1");

  return url.toString();
}

function getClientIpAddress(request: Request): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null
  );
}

function getExpiresAt(
  payload: Record<string, unknown>,
  key: string,
): Date | null {
  const value = payload[key];

  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return new Date(Date.now() + value * 1000);
}

function getRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Expected object payload.");
  }

  return value as Record<string, unknown>;
}

function getString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];

  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${key} is required.`);
  }

  return value;
}

function getOptionalString(
  payload: Record<string, unknown>,
  key: string,
): string | null {
  const value = payload[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}

function getOptionalBoolean(
  payload: Record<string, unknown>,
  key: string,
): boolean | null {
  const value = payload[key];

  return typeof value === "boolean" ? value : null;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
