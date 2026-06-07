import type {
  SpaceSummary,
  SupportedCurrency,
  UserSettings,
} from "./spaces.js";

export interface SpaceRepository {
  findUserSettings(userId: string): Promise<UserSettings | null>;
  hasMembership(userId: string, spaceId: string): Promise<boolean>;
  listSpacesForUser(userId: string): Promise<SpaceSummary[]>;
  setSpaceCurrency(
    userId: string,
    spaceId: string,
    currencyCode: SupportedCurrency,
  ): Promise<SpaceSummary>;
  setDefaultSpaceId(
    userId: string,
    defaultSpaceId: string,
  ): Promise<UserSettings>;
}
