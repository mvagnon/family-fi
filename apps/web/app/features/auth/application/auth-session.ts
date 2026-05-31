import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SignInWithEmailInput } from "../domain/auth";
import type { AuthRepository } from "../domain/auth-repository";

export const authQueryKeys = {
  session: () => ["auth", "session"] as const,
};

export function useAuthSession(repository: AuthRepository) {
  const session = useQuery({
    queryFn: () => repository.getSession(),
    queryKey: authQueryKeys.session(),
    retry: false,
  });

  return {
    error: session.error,
    isAuthenticated: !!session.data,
    isPending: session.isPending,
    isRefetching: session.isRefetching,
    refetch: session.refetch,
    user: session.data ?? null,
  };
}

export function useSignInWithEmail(repository: AuthRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInWithEmailInput) => {
      return repository.signInWithEmail(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: authQueryKeys.session(),
      });
    },
  });
}

export function useSignOut(repository: AuthRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => repository.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.session(), null);
      void queryClient.invalidateQueries({
        queryKey: authQueryKeys.session(),
      });
    },
  });
}
