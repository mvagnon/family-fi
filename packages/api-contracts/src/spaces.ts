import { z } from "zod";

export const spaceRoleSchema = z.enum(["owner", "member"]);

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

export type SpaceRole = z.infer<typeof spaceRoleSchema>;
export type SupportedCurrency = z.infer<typeof supportedCurrencySchema>;
export type SpaceSummary = z.infer<typeof spaceSummarySchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UpdateDefaultSpaceInput = z.infer<
  typeof updateDefaultSpaceInputSchema
>;
export type UpdateSpaceCurrencyInput = z.infer<
  typeof updateSpaceCurrencyInputSchema
>;
