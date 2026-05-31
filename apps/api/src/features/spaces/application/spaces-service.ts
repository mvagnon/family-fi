import type { SpaceRepository } from "../domain/space-repository.js";
import {
  InvalidSpaceInputError,
  SpaceAccessDeniedError,
} from "../domain/spaces.js";
import type {
  SpaceSummary,
  UpdateDefaultSpaceInput,
  UserSettings,
} from "../domain/spaces.js";

export class SpacesService {
  constructor(private readonly repository: SpaceRepository) {}

  async listSpacesForUser(userId: string): Promise<SpaceSummary[]> {
    return this.repository.listSpacesForUser(userId);
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    const settings = await this.repository.findUserSettings(userId);

    if (
      settings?.defaultSpaceId &&
      (await this.repository.hasMembership(userId, settings.defaultSpaceId))
    ) {
      return settings;
    }

    const [firstSpace] = await this.repository.listSpacesForUser(userId);

    return {
      defaultSpaceId: firstSpace?.id ?? null,
    };
  }

  async updateDefaultSpace(
    userId: string,
    input: UpdateDefaultSpaceInput,
  ): Promise<UserSettings> {
    const defaultSpaceId = requireText(
      input.defaultSpaceId,
      "Default space is required.",
    );

    await this.assertUserCanAccessSpace(userId, defaultSpaceId);

    return this.repository.setDefaultSpaceId(userId, defaultSpaceId);
  }

  async assertUserCanAccessSpace(
    userId: string,
    spaceId: string,
  ): Promise<void> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");
    const hasAccess = await this.repository.hasMembership(
      userId,
      normalizedSpaceId,
    );

    if (!hasAccess) {
      throw new SpaceAccessDeniedError();
    }
  }
}

function requireText(value: string, message: string): string {
  const text = value.trim();

  if (!text) {
    throw new InvalidSpaceInputError(message);
  }

  return text;
}
