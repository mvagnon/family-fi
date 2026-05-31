export interface AuthenticatedUser {
  email: string;
  id: string;
  name: string;
}

export interface AuthSession {
  user: AuthenticatedUser;
}

export interface AuthProvider {
  getSession(request: Request): Promise<AuthSession | null>;
  handleRequest(request: Request): Promise<Response> | Response;
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "UnauthenticatedError";
  }
}
