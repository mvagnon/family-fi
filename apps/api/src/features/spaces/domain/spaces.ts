export {
  addSpaceMemberInputSchema,
  assignableSpaceRoleSchema,
  defaultSpaceCurrency,
  searchSpaceUsersQuerySchema,
  spaceMemberSchema,
  spaceRoleSchema,
  spaceSummarySchema,
  spaceUserSearchResultSchema,
  supportedCurrencyCodes,
  supportedCurrencySchema,
  updateDefaultSpaceInputSchema,
  updateSpaceMemberInputSchema,
  updateSpaceCurrencyInputSchema,
  userSettingsSchema,
} from "@repo/api-contracts/spaces";

export type {
  AddSpaceMemberInput,
  AssignableSpaceRole,
  SearchSpaceUsersQuery,
  SpaceMember,
  SpaceRole,
  SpaceSummary,
  SpaceUserSearchResult,
  SupportedCurrency,
  UpdateDefaultSpaceInput,
  UpdateSpaceMemberInput,
  UpdateSpaceCurrencyInput,
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

export class SpaceMemberAlreadyExistsError extends Error {
  constructor() {
    super("User already belongs to this space.");
    this.name = "SpaceMemberAlreadyExistsError";
  }
}

export class SpaceMemberNotFoundError extends Error {
  constructor() {
    super("Space member was not found.");
    this.name = "SpaceMemberNotFoundError";
  }
}

export class SpaceOwnerRoleChangeError extends Error {
  constructor() {
    super("Space owners cannot be changed through member role updates.");
    this.name = "SpaceOwnerRoleChangeError";
  }
}

export class SpaceUserNotFoundError extends Error {
  constructor() {
    super("User was not found.");
    this.name = "SpaceUserNotFoundError";
  }
}
