import type {
  AssignableSpaceRole,
  SpaceMember,
  SpaceRole,
  SpaceSummary,
  SpaceUserSearchResult,
  SupportedCurrency,
  UserSettings,
} from "./spaces.js";

export interface SpaceRepository {
  addSpaceMember(
    spaceId: string,
    userId: string,
    role: AssignableSpaceRole,
  ): Promise<SpaceMember>;
  findMembershipRole(
    userId: string,
    spaceId: string,
  ): Promise<SpaceRole | null>;
  findUserSettings(userId: string): Promise<UserSettings | null>;
  hasUser(userId: string): Promise<boolean>;
  hasMembership(userId: string, spaceId: string): Promise<boolean>;
  listSpaceMembers(spaceId: string): Promise<SpaceMember[]>;
  listSpacesForUser(userId: string): Promise<SpaceSummary[]>;
  removeSpaceMember(spaceId: string, userId: string): Promise<void>;
  searchUsersForSpace(
    spaceId: string,
    query: string,
  ): Promise<SpaceUserSearchResult[]>;
  setSpaceCurrency(
    userId: string,
    spaceId: string,
    currencyCode: SupportedCurrency,
  ): Promise<SpaceSummary>;
  setDefaultSpaceId(
    userId: string,
    defaultSpaceId: string,
  ): Promise<UserSettings>;
  updateSpaceMemberRole(
    spaceId: string,
    userId: string,
    role: AssignableSpaceRole,
  ): Promise<SpaceMember>;
}
