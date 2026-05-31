import type { AuthUser, SignInWithEmailInput } from "./auth";

export interface AuthSessionState {
  data: { user: AuthUser } | null;
  error: Error | null;
  isPending: boolean;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

export interface AuthRepository {
  signIn: {
    email(input: SignInWithEmailInput): Promise<{
      error: { message?: string } | null;
    }>;
  };
  useSession(): AuthSessionState;
}
