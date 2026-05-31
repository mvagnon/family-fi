import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useAuthSession } from "../application/auth-session";
import type { AuthRepository } from "../domain/auth-repository";

interface AuthenticatedRouteProps {
  children: ReactNode;
  client: AuthRepository;
}

interface PublicOnlyRouteProps {
  children: ReactNode;
  client: AuthRepository;
}

export function AuthenticatedRoute({
  children,
  client,
}: AuthenticatedRouteProps) {
  const session = useAuthSession(client);

  if (session.isPending) {
    return <AuthRouteLoading />;
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
    return <Navigate replace to="/dashboard" />;
  }

  return children;
}

export function HomeRedirect({ client }: { client: AuthRepository }) {
  const session = useAuthSession(client);

  if (session.isPending) {
    return <AuthRouteLoading />;
  }

  return (
    <Navigate replace to={session.isAuthenticated ? "/dashboard" : "/login"} />
  );
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
