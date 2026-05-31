import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuthSession } from "../application/auth-session";
import type { AuthRepository } from "../domain/auth-repository";

interface AuthenticatedRouteProps {
  children: ReactNode;
  client: AuthRepository;
  errorFallback?: ReactNode;
  pendingFallback?: ReactNode;
}

interface PublicOnlyRouteProps {
  children: ReactNode;
  client: AuthRepository;
}

export function AuthenticatedRoute({
  children,
  client,
  errorFallback,
  pendingFallback,
}: AuthenticatedRouteProps) {
  const session = useAuthSession(client);

  if (session.isPending) {
    return pendingFallback ?? <AuthRouteLoading />;
  }

  if (session.error && !session.isAuthenticated) {
    return errorFallback ?? <AuthRouteLoading />;
  }

  if (!session.isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

export function PublicOnlyRoute({ children, client }: PublicOnlyRouteProps) {
  const session = useAuthSession(client);

  if (session.isPending) {
    return <AuthRouteLoading />;
  }

  if (session.isAuthenticated) {
    return <Navigate replace to="/family" />;
  }

  return children;
}

export function HomeRedirect() {
  return <Navigate replace to="/family" />;
}

function AuthRouteLoading() {
  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        bgcolor: "background.default",
        color: "primary.main",
        display: "grid",
        minHeight: "100vh",
        placeItems: "center",
      }}
    >
      <CircularProgress aria-label="Loading session" size={28} />
    </Box>
  );
}
