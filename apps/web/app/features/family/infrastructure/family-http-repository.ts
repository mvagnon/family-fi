import type { ApiAppType } from "api/app";
import { hc } from "hono/client";

import type { Family } from "../domain/family";
import type { FamilyRepository } from "../domain/family-repository";
import { FamilyApiError, parseFamilyResponse } from "./family-dto";

export { FamilyApiError } from "./family-dto";

interface FamilyHttpRepositoryOptions {
  apiBaseUrl?: string;
  fetcher?: typeof fetch;
}

export const familyHttpRepository = createFamilyHttpRepository();

export function createFamilyHttpRepository(
  options: FamilyHttpRepositoryOptions = {},
): FamilyRepository {
  const apiBaseUrl = normalizeApiBaseUrl(
    options.apiBaseUrl ?? getConfiguredApiBaseUrl(),
  );
  const fetcher = options.fetcher ?? fetch;
  const client = hc<ApiAppType>(apiBaseUrl, { fetch: fetcher });

  async function readFamilyResponse(response: {
    json: () => Promise<unknown>;
    ok: boolean;
  }): Promise<Family> {
    if (!response.ok) {
      throw new FamilyApiError(await getErrorMessage(response));
    }

    return parseFamilyResponse(await response.json());
  }

  return {
    addCategory: async (input) =>
      readFamilyResponse(
        await client.api.family.categories.$post({ json: input }),
      ),
    addMember: async (input) =>
      readFamilyResponse(
        await client.api.family.members.$post({ json: input }),
      ),
    createRecurringLine: async (input) =>
      readFamilyResponse(
        await client.api.family["recurring-lines"].$post({ json: input }),
      ),
    getFamily: async () => readFamilyResponse(await client.api.family.$get()),
    updateRecurringLine: async (lineId, input) =>
      readFamilyResponse(
        await client.api.family["recurring-lines"][":id"].$put({
          json: input,
          param: { id: lineId },
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

  return "La famille n'a pas pu être chargée.";
}

function getConfiguredApiBaseUrl(): string {
  const env = import.meta.env as { VITE_API_BASE_URL?: string } | undefined;

  return env?.VITE_API_BASE_URL ?? "http://localhost:3000";
}

function normalizeApiBaseUrl(value: string): string {
  return value.replace(/\/$/, "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
