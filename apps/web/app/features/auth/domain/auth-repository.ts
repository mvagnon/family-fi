import type { AuthUser } from "./auth";

export interface AuthRepository {
  getSession(): Promise<AuthUser | null>;
  signInWithHub(): Promise<void>;
  signOut(): Promise<void>;
}
