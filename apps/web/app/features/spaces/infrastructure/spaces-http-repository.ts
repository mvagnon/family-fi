import type { ApiAppType } from "api/app";
import { hc } from "hono/client";

import {
  fetchWithCredentials,
  getConfiguredApiBaseUrl,
  normalizeApiBaseUrl,
} from "~/infrastructure/api-client";
import type { SpaceRepository } from "../domain/space-repository";
import type {
  SpaceMember,
  SpaceSummary,
  SpaceUserSearchResult,
  UserSettings,
} from "../domain/spaces";
import {
  parseSpaceMembersResponse,
  parseSpacesResponse,
  parseSpaceUserSearchResponse,
  parseUserSettingsResponse,
  SpacesApiError,
} from "./spaces-dto";

export { SpacesApiError } from "./spaces-dto";

interface SpacesHttpRepositoryOptions {
  apiBaseUrl?: string;
  fetcher?: typeof fetch;
}

export const spacesHttpRepository = createSpacesHttpRepository();

export function createSpacesHttpRepository(
  options: SpacesHttpRepositoryOptions = {},
): SpaceRepository {
  const apiBaseUrl = normalizeApiBaseUrl(
    options.apiBaseUrl ?? getConfiguredApiBaseUrl(),
  );
  const fetcher = options.fetcher ?? fetchWithCredentials;
  const client = hc<ApiAppType>(apiBaseUrl, { fetch: fetcher });

  async function readSpacesResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<SpaceSummary[]> {
    if (!response.ok) {
      throw new SpacesApiError(await getErrorMessage(response));
    }

    return parseSpacesResponse(await response.json());
  }

  async function readSpaceResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<SpaceSummary> {
    if (!response.ok) {
      throw new SpacesApiError(await getErrorMessage(response));
    }

    const [space] = parseSpacesResponse([await response.json()]);

    return space;
  }

  async function readUserSettingsResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<UserSettings> {
    if (!response.ok) {
      throw new SpacesApiError(await getErrorMessage(response));
    }

    return parseUserSettingsResponse(await response.json());
  }

  async function readSpaceMembersResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<SpaceMember[]> {
    if (!response.ok) {
      throw new SpacesApiError(await getErrorMessage(response));
    }

    return parseSpaceMembersResponse(await response.json());
  }

  async function readSpaceMemberResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<SpaceMember> {
    if (!response.ok) {
      throw new SpacesApiError(await getErrorMessage(response));
    }

    const [member] = parseSpaceMembersResponse([await response.json()]);

    return member;
  }

  async function readSpaceUserSearchResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<SpaceUserSearchResult[]> {
    if (!response.ok) {
      throw new SpacesApiError(await getErrorMessage(response));
    }

    return parseSpaceUserSearchResponse(await response.json());
  }

  return {
    addSpaceMember: async (spaceId, input) =>
      readSpaceMemberResponse(
        await client.api.spaces[":spaceId"].members.$post({
          json: input,
          param: { spaceId },
        }),
      ),
    getUserSettings: async () =>
      readUserSettingsResponse(await client.api.me.settings.$get()),
    listSpaceMembers: async (spaceId) =>
      readSpaceMembersResponse(
        await client.api.spaces[":spaceId"].members.$get({
          param: { spaceId },
        }),
      ),
    listSpaces: async () => readSpacesResponse(await client.api.spaces.$get()),
    removeSpaceMember: async (spaceId, userId) => {
      const response = await client.api.spaces[":spaceId"].members[
        ":userId"
      ].$delete({
        param: { spaceId, userId },
      });

      if (!response.ok) {
        throw new SpacesApiError(await getErrorMessage(response));
      }
    },
    searchSpaceUsers: async (spaceId, input) =>
      readSpaceUserSearchResponse(
        await client.api.spaces[":spaceId"].users.search.$get({
          param: { spaceId },
          query: input,
        }),
      ),
    updateDefaultSpace: async (input) =>
      readUserSettingsResponse(
        await client.api.me.settings["default-space"].$put({ json: input }),
      ),
    updateSpaceMember: async (spaceId, userId, input) =>
      readSpaceMemberResponse(
        await client.api.spaces[":spaceId"].members[":userId"].$put({
          json: input,
          param: { spaceId, userId },
        }),
      ),
    updateSpaceCurrency: async (spaceId, input) =>
      readSpaceResponse(
        await client.api.spaces[":spaceId"].settings.currency.$put({
          json: input,
          param: { spaceId },
        }),
      ),
  };
}

async function getErrorMessage(response: {
  json: () => Promise<unknown>;
}): Promise<string> {
  const value = await response.json().catch(() => null);

  if (isRecord(value) && typeof value.message === "string") {
    return value.message;
  }

  return "Les espaces n'ont pas pu être chargés.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
