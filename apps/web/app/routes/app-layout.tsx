import { authClient } from "~/features/auth/infrastructure/auth-client";
import { AuthenticatedRoute } from "~/features/auth/presentation/auth-route-gates";
import { AppShellLayout } from "~/features/app-shell/presentation/app-shell-layout";

export default function AppLayoutRoute() {
  return (
    <AuthenticatedRoute client={authClient}>
      <AppShellLayout />
    </AuthenticatedRoute>
  );
}
