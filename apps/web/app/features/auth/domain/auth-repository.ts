import type { AuthUser } from "./auth";

export interface AuthRepository {
  getSession(): Promise<AuthUser | null>;
  signInWithLogto(): Promise<void>;
  signOut(): Promise<string>;
}
