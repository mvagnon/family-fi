import type {
  SpaceSummary,
  UpdateDefaultSpaceInput,
  UserSettings,
} from "./spaces";

export interface SpaceRepository {
  getUserSettings(): Promise<UserSettings>;
  listSpaces(): Promise<SpaceSummary[]>;
  updateDefaultSpace(input: UpdateDefaultSpaceInput): Promise<UserSettings>;
}
