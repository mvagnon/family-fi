import { z } from "zod";

export const spaceRoleSchema = z.enum(["owner", "write", "read"]);
export const assignableSpaceRoleSchema = z.enum(["write", "read"]);

export const supportedCurrencyCodes = [
  "EUR",
  "USD",
  "JPY",
  "GBP",
  "CHF",
  "CAD",
  "AUD",
  "NZD",
  "CNY",
  "HKD",
  "SGD",
  "KRW",
  "INR",
  "BRL",
  "MXN",
] as const;

export const defaultSpaceCurrency =
  "EUR" satisfies (typeof supportedCurrencyCodes)[number];

export const supportedCurrencySchema = z
  .enum(supportedCurrencyCodes)
  .meta({ id: "SupportedCurrency" });

export const spaceSummarySchema = z
  .object({
    currencyCode: supportedCurrencySchema,
    id: z.string(),
    name: z.string(),
    ownerEmail: z.string(),
    role: spaceRoleSchema,
  })
  .meta({ id: "SpaceSummary" });

export const spaceMemberSchema = z
  .object({
    email: z.string(),
    name: z.string(),
    role: spaceRoleSchema,
    userId: z.string(),
  })
  .meta({ id: "SpaceMember" });

export const spaceUserSearchResultSchema = z
  .object({
    email: z.string(),
    id: z.string(),
    name: z.string(),
  })
  .meta({ id: "SpaceUserSearchResult" });

export const userSettingsSchema = z
  .object({
    defaultSpaceId: z.string().nullable(),
  })
  .meta({ id: "UserSettings" });

export const updateDefaultSpaceInputSchema = z.object({
  defaultSpaceId: z
    .string({ error: "Default space is required." })
    .trim()
    .min(1, {
      message: "Default space is required.",
    }),
});

export const updateSpaceCurrencyInputSchema = z
  .object({
    currencyCode: supportedCurrencySchema,
  })
  .meta({ id: "UpdateSpaceCurrencyInput" });

export const searchSpaceUsersQuerySchema = z
  .object({
    query: z
      .string({ error: "Search query is required." })
      .trim()
      .min(4, { message: "Search query must contain at least 4 characters." }),
  })
  .meta({ id: "SearchSpaceUsersQuery" });

export const addSpaceMemberInputSchema = z
  .object({
    role: assignableSpaceRoleSchema,
    userId: z
      .string({ error: "User is required." })
      .trim()
      .min(1, { message: "User is required." }),
  })
  .meta({ id: "AddSpaceMemberInput" });

export const updateSpaceMemberInputSchema = z
  .object({
    role: assignableSpaceRoleSchema,
  })
  .meta({ id: "UpdateSpaceMemberInput" });

export type AssignableSpaceRole = z.infer<typeof assignableSpaceRoleSchema>;
export type SpaceRole = z.infer<typeof spaceRoleSchema>;
export type SpaceMember = z.infer<typeof spaceMemberSchema>;
export type SpaceUserSearchResult = z.infer<typeof spaceUserSearchResultSchema>;
export type SupportedCurrency = z.infer<typeof supportedCurrencySchema>;
export type SpaceSummary = z.infer<typeof spaceSummarySchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UpdateDefaultSpaceInput = z.infer<
  typeof updateDefaultSpaceInputSchema
>;
export type UpdateSpaceCurrencyInput = z.infer<
  typeof updateSpaceCurrencyInputSchema
>;
export type SearchSpaceUsersQuery = z.infer<typeof searchSpaceUsersQuerySchema>;
export type AddSpaceMemberInput = z.infer<typeof addSpaceMemberInputSchema>;
export type UpdateSpaceMemberInput = z.infer<
  typeof updateSpaceMemberInputSchema
>;
