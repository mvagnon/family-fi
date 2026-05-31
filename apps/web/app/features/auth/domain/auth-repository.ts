import type { AuthUser, SignInWithEmailInput } from "./auth";

export interface AuthRepository {
  getSession(): Promise<AuthUser | null>;
  signInWithEmail(input: SignInWithEmailInput): Promise<void>;
}
