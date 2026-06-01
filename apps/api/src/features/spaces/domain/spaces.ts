export {
  spaceRoleSchema,
  spaceSummarySchema,
  updateDefaultSpaceInputSchema,
  userSettingsSchema,
} from "@repo/api-contracts/spaces";

export type {
  SpaceRole,
  SpaceSummary,
  UpdateDefaultSpaceInput,
  UserSettings,
} from "@repo/api-contracts/spaces";

export class InvalidSpaceInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSpaceInputError";
  }
}

export class SpaceAccessDeniedError extends Error {
  constructor() {
    super("Space is not accessible.");
    this.name = "SpaceAccessDeniedError";
  }
}
