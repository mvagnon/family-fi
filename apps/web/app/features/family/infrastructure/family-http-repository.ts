import type { Family } from "../domain/family";
import type { FamilyRepository } from "../domain/family-repository";
import { FamilyApiError, parseFamilyResponse } from "./family-dto";

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

  async function requestFamily(
    path: string,
    init: RequestInit = {},
  ): Promise<Family> {
    const response = await fetcher(`${apiBaseUrl}/api/family${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new FamilyApiError(await getErrorMessage(response));
    }

    return parseFamilyResponse(await response.json());
  }

  return {
    addCategory: (input) =>
      requestFamily("/categories", {
        body: JSON.stringify(input),
        method: "POST",
      }),
    addMember: (input) =>
      requestFamily("/members", {
        body: JSON.stringify(input),
        method: "POST",
      }),
    createRecurringLine: (input) =>
      requestFamily("/recurring-lines", {
        body: JSON.stringify(input),
        method: "POST",
      }),
    getFamily: () => requestFamily(""),
    updateRecurringLine: (lineId, input) =>
      requestFamily(`/recurring-lines/${lineId}`, {
        body: JSON.stringify(input),
        method: "PUT",
      }),
  };
}

async function getErrorMessage(response: Response): Promise<string> {
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
