import { z } from "zod";

export const spaceRoleSchema = z.enum(["owner", "member"]);

export type SpaceRole = z.infer<typeof spaceRoleSchema>;

export interface SpaceSummary {
  id: string;
  name: string;
  role: SpaceRole;
}

export interface UserSettings {
  defaultSpaceId: string | null;
}

export interface UpdateDefaultSpaceInput {
  defaultSpaceId: string;
}

export const updateDefaultSpaceInputSchema = z.object({
  defaultSpaceId: z
    .string({ error: "Default space is required." })
    .trim()
    .min(1, {
      message: "Default space is required.",
    }),
});
