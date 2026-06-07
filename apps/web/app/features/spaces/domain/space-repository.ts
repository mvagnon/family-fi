import type {
  SpaceSummary,
  UpdateDefaultSpaceInput,
  UpdateSpaceCurrencyInput,
  UserSettings,
} from "./spaces";

export interface SpaceRepository {
  getUserSettings(): Promise<UserSettings>;
  listSpaces(): Promise<SpaceSummary[]>;
  updateDefaultSpace(input: UpdateDefaultSpaceInput): Promise<UserSettings>;
  updateSpaceCurrency(
    spaceId: string,
    input: UpdateSpaceCurrencyInput,
  ): Promise<SpaceSummary>;
}
