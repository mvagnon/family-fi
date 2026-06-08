import type {
  AddSpaceMemberInput,
  SearchSpaceUsersQuery,
  SpaceMember,
  SpaceSummary,
  SpaceUserSearchResult,
  UpdateDefaultSpaceInput,
  UpdateSpaceMemberInput,
  UpdateSpaceCurrencyInput,
  UserSettings,
} from "./spaces";

export interface SpaceRepository {
  addSpaceMember(
    spaceId: string,
    input: AddSpaceMemberInput,
  ): Promise<SpaceMember>;
  getUserSettings(): Promise<UserSettings>;
  listSpaceMembers(spaceId: string): Promise<SpaceMember[]>;
  listSpaces(): Promise<SpaceSummary[]>;
  removeSpaceMember(spaceId: string, userId: string): Promise<void>;
  searchSpaceUsers(
    spaceId: string,
    input: SearchSpaceUsersQuery,
  ): Promise<SpaceUserSearchResult[]>;
  updateDefaultSpace(input: UpdateDefaultSpaceInput): Promise<UserSettings>;
  updateSpaceMember(
    spaceId: string,
    userId: string,
    input: UpdateSpaceMemberInput,
  ): Promise<SpaceMember>;
  updateSpaceCurrency(
    spaceId: string,
    input: UpdateSpaceCurrencyInput,
  ): Promise<SpaceSummary>;
}
