export interface AuthenticatedUser {
  email: string;
  id: string;
  ikiUserId: string;
  name: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "UnauthenticatedError";
  }
}
