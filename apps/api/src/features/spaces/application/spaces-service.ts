import type { SpaceRepository } from "../domain/space-repository.js";
import {
  InvalidSpaceInputError,
  SpaceAccessDeniedError,
  SpaceMemberAlreadyExistsError,
  SpaceMemberNotFoundError,
  SpaceOwnerRoleChangeError,
  SpaceUserNotFoundError,
} from "../domain/spaces.js";
import type {
  AddSpaceMemberInput,
  AssignableSpaceRole,
  SearchSpaceUsersQuery,
  SpaceMember,
  SpaceRole,
  SpaceSummary,
  SpaceUserSearchResult,
  UpdateDefaultSpaceInput,
  UpdateSpaceMemberInput,
  UpdateSpaceCurrencyInput,
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

  async updateSpaceCurrency(
    userId: string,
    spaceId: string,
    input: UpdateSpaceCurrencyInput,
  ): Promise<SpaceSummary> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");

    await this.assertUserOwnsSpace(userId, normalizedSpaceId);

    return this.repository.setSpaceCurrency(
      userId,
      normalizedSpaceId,
      input.currencyCode,
    );
  }

  async listSpaceMembers(
    userId: string,
    spaceId: string,
  ): Promise<SpaceMember[]> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");

    await this.assertUserOwnsSpace(userId, normalizedSpaceId);

    return this.repository.listSpaceMembers(normalizedSpaceId);
  }

  async searchSpaceUsers(
    userId: string,
    spaceId: string,
    input: SearchSpaceUsersQuery,
  ): Promise<SpaceUserSearchResult[]> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");
    const query = requireText(input.query, "Search query is required.");

    if (query.length < 4) {
      throw new InvalidSpaceInputError(
        "Search query must contain at least 4 characters.",
      );
    }

    await this.assertUserOwnsSpace(userId, normalizedSpaceId);

    return this.repository.searchUsersForSpace(normalizedSpaceId, query);
  }

  async addSpaceMember(
    userId: string,
    spaceId: string,
    input: AddSpaceMemberInput,
  ): Promise<SpaceMember> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");
    const targetUserId = requireText(input.userId, "User is required.");
    const role = requireAssignableRole(input.role);

    await this.assertUserOwnsSpace(userId, normalizedSpaceId);

    if (!(await this.repository.hasUser(targetUserId))) {
      throw new SpaceUserNotFoundError();
    }

    if (
      await this.repository.findMembershipRole(targetUserId, normalizedSpaceId)
    ) {
      throw new SpaceMemberAlreadyExistsError();
    }

    return this.repository.addSpaceMember(
      normalizedSpaceId,
      targetUserId,
      role,
    );
  }

  async updateSpaceMemberRole(
    userId: string,
    spaceId: string,
    memberUserId: string,
    input: UpdateSpaceMemberInput,
  ): Promise<SpaceMember> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");
    const targetUserId = requireText(memberUserId, "User is required.");
    const role = requireAssignableRole(input.role);

    await this.assertUserOwnsSpace(userId, normalizedSpaceId);
    await this.assertManagedMember(normalizedSpaceId, targetUserId);

    return this.repository.updateSpaceMemberRole(
      normalizedSpaceId,
      targetUserId,
      role,
    );
  }

  async removeSpaceMember(
    userId: string,
    spaceId: string,
    memberUserId: string,
  ): Promise<void> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");
    const targetUserId = requireText(memberUserId, "User is required.");

    await this.assertUserOwnsSpace(userId, normalizedSpaceId);
    await this.assertManagedMember(normalizedSpaceId, targetUserId);

    await this.repository.removeSpaceMember(normalizedSpaceId, targetUserId);
  }

  async assertUserCanAccessSpace(
    userId: string,
    spaceId: string,
  ): Promise<void> {
    await this.assertUserCanReadSpace(userId, spaceId);
  }

  async assertUserCanReadSpace(userId: string, spaceId: string): Promise<void> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");
    const role = await this.repository.findMembershipRole(
      userId,
      normalizedSpaceId,
    );

    if (!role) {
      throw new SpaceAccessDeniedError();
    }
  }

  async assertUserCanWriteSpace(
    userId: string,
    spaceId: string,
  ): Promise<void> {
    const role = await this.getRequiredMembershipRole(userId, spaceId);

    if (!canWriteSpace(role)) {
      throw new SpaceAccessDeniedError();
    }
  }

  async assertUserOwnsSpace(userId: string, spaceId: string): Promise<void> {
    const role = await this.getRequiredMembershipRole(userId, spaceId);

    if (role !== "owner") {
      throw new SpaceAccessDeniedError();
    }
  }

  private async getRequiredMembershipRole(
    userId: string,
    spaceId: string,
  ): Promise<SpaceRole> {
    const normalizedSpaceId = requireText(spaceId, "Space is required.");
    const role = await this.repository.findMembershipRole(
      userId,
      normalizedSpaceId,
    );

    if (!role) {
      throw new SpaceAccessDeniedError();
    }

    return role;
  }

  private async assertManagedMember(
    spaceId: string,
    userId: string,
  ): Promise<void> {
    const role = await this.repository.findMembershipRole(userId, spaceId);

    if (!role) {
      throw new SpaceMemberNotFoundError();
    }

    if (role === "owner") {
      throw new SpaceOwnerRoleChangeError();
    }
  }
}

function canWriteSpace(role: SpaceRole): boolean {
  return role === "owner" || role === "write";
}

function requireAssignableRole(role: string): AssignableSpaceRole {
  if (role === "read" || role === "write") {
    return role;
  }

  throw new InvalidSpaceInputError("Space role is invalid.");
}

function requireText(value: string, message: string): string {
  const text = value.trim();

  if (!text) {
    throw new InvalidSpaceInputError(message);
  }

  return text;
}
