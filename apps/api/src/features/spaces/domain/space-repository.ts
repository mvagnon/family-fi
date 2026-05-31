import type { SpaceSummary, UserSettings } from "./spaces.js";

export interface SpaceRepository {
  findUserSettings(userId: string): Promise<UserSettings | null>;
  hasMembership(userId: string, spaceId: string): Promise<boolean>;
  listSpacesForUser(userId: string): Promise<SpaceSummary[]>;
  setDefaultSpaceId(
    userId: string,
    defaultSpaceId: string,
  ): Promise<UserSettings>;
}
