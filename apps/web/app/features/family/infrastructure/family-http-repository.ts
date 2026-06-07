import type { ApiAppType } from "api/app";
import { hc } from "hono/client";

import {
  fetchWithCredentials,
  getConfiguredApiBaseUrl,
  normalizeApiBaseUrl,
} from "~/infrastructure/api-client";
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
  const fetcher = options.fetcher ?? fetchWithCredentials;
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
    addCategory: async (spaceId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.categories.$post({
          json: input,
          param: { spaceId },
        }),
      ),
    addMember: async (spaceId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.members.$post({
          json: input,
          param: { spaceId },
        }),
      ),
    createRecurringLine: async (spaceId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["recurring-lines"].$post({
          json: input,
          param: { spaceId },
        }),
      ),
    createParticipationLine: async (spaceId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["participation-lines"].$post(
          {
            json: input,
            param: { spaceId },
          },
        ),
      ),
    createLoan: async (spaceId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.loans.$post({
          json: input,
          param: { spaceId },
        }),
      ),
    createLoanRepaymentLine: async (spaceId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family[
          "loan-repayment-lines"
        ].$post({
          json: input,
          param: { spaceId },
        }),
      ),
    deleteLoan: async (spaceId, loanId) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.loans[":id"].$delete({
          param: { id: loanId, spaceId },
        }),
      ),
    deleteLoanRepaymentLine: async (spaceId, lineId) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["loan-repayment-lines"][
          ":id"
        ].$delete({
          param: { id: lineId, spaceId },
        }),
      ),
    deleteParticipationLine: async (spaceId, lineId) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["participation-lines"][
          ":id"
        ].$delete({
          param: { id: lineId, spaceId },
        }),
      ),
    deleteCategory: async (spaceId, categoryId) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.categories[":id"].$delete({
          param: { id: categoryId, spaceId },
        }),
      ),
    deleteMember: async (spaceId, memberId) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.members[":id"].$delete({
          param: { id: memberId, spaceId },
        }),
      ),
    deleteRecurringLine: async (spaceId, lineId) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["recurring-lines"][
          ":id"
        ].$delete({
          param: { id: lineId, spaceId },
        }),
      ),
    getFamily: async (spaceId) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.$get({
          param: { spaceId },
        }),
      ),
    updateMember: async (spaceId, memberId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.members[":id"].$put({
          json: input,
          param: { id: memberId, spaceId },
        }),
      ),
    updateRecurringLine: async (spaceId, lineId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["recurring-lines"][
          ":id"
        ].$put({
          json: input,
          param: { id: lineId, spaceId },
        }),
      ),
    updateParticipationLine: async (spaceId, lineId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["participation-lines"][
          ":id"
        ].$put({
          json: input,
          param: { id: lineId, spaceId },
        }),
      ),
    updateLoan: async (spaceId, loanId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family.loans[":id"].$put({
          json: input,
          param: { id: loanId, spaceId },
        }),
      ),
    updateLoanRepaymentLine: async (spaceId, lineId, input) =>
      readFamilyResponse(
        await client.api.spaces[":spaceId"].family["loan-repayment-lines"][
          ":id"
        ].$put({
          json: input,
          param: { id: lineId, spaceId },
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
