import type { ApiAppType } from "api/app";
import { hc } from "hono/client";

import {
  fetchWithCredentials,
  getConfiguredApiBaseUrl,
  normalizeApiBaseUrl,
} from "~/infrastructure/api-client";
import type { SpaceRepository } from "../domain/space-repository";
import type { SpaceSummary, UserSettings } from "../domain/spaces";
import {
  parseSpacesResponse,
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

  async function readUserSettingsResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<UserSettings> {
    if (!response.ok) {
      throw new SpacesApiError(await getErrorMessage(response));
    }

    return parseUserSettingsResponse(await response.json());
  }

  return {
    getUserSettings: async () =>
      readUserSettingsResponse(await client.api.me.settings.$get()),
    listSpaces: async () => readSpacesResponse(await client.api.spaces.$get()),
    updateDefaultSpace: async (input) =>
      readUserSettingsResponse(
        await client.api.me.settings["default-space"].$put({ json: input }),
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
