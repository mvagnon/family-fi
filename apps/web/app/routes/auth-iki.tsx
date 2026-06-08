import { useEffect, useRef } from "react";
import { Navigate } from "react-router";

import {
  useAuthSession,
  useSignInWithHub,
} from "~/features/auth/application/auth-session";
import { authClient } from "~/features/auth/infrastructure/auth-client";
import { getConfiguredLoginFallbackUrl } from "~/infrastructure/runtime-config";

export default function IkiAuthRoute() {
  const session = useAuthSession(authClient);
  const { mutate } = useSignInWithHub(authClient);
  const hasStartedRedirect = useRef(false);
  const loginFallbackUrl = getConfiguredLoginFallbackUrl();

  useEffect(() => {
    if (
      session.isPending ||
      session.isAuthenticated ||
      hasStartedRedirect.current
    ) {
      return;
    }

    hasStartedRedirect.current = true;
    mutate(undefined, {
      onError: () => window.location.assign(loginFallbackUrl),
    });
  }, [loginFallbackUrl, mutate, session.isAuthenticated, session.isPending]);

  if (session.isAuthenticated) {
    return <Navigate replace to="/family" />;
  }

  return null;
}
