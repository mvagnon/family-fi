import { z } from "zod";

export const spaceRoleSchema = z.enum(["owner", "member"]);

export const spaceSummarySchema = z
  .object({
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

export type SpaceRole = z.infer<typeof spaceRoleSchema>;
export type SpaceSummary = z.infer<typeof spaceSummarySchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;
export type UpdateDefaultSpaceInput = z.infer<
  typeof updateDefaultSpaceInputSchema
>;
