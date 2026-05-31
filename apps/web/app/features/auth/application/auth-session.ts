import { useMutation } from "@tanstack/react-query";

import type { SignInWithEmailInput } from "../domain/auth";
import type { AuthRepository } from "../domain/auth-repository";

export function useAuthSession(repository: AuthRepository) {
  const session = repository.useSession();

  return {
    error: session.error,
    isAuthenticated: !!session.data?.user,
    isPending: session.isPending,
    isRefetching: session.isRefetching,
    refetch: session.refetch,
    user: session.data?.user ?? null,
  };
}

export function useSignInWithEmail(repository: AuthRepository) {
  return useMutation({
    mutationFn: async (input: SignInWithEmailInput) => {
      const result = await repository.signIn.email({
        email: input.email,
        password: input.password,
      });

      if (result.error) {
        throw new Error("Invalid email or password.");
      }
    },
  });
}
