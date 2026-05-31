import { authClient } from "~/features/auth/infrastructure/auth-client";
import { AuthenticatedRoute } from "~/features/auth/presentation/auth-route-gates";
import { AppShellLayout } from "~/features/app-shell/presentation/app-shell-layout";
import { ActiveSpaceProvider } from "~/features/spaces/presentation/active-space-provider";
import { spacesHttpRepository } from "~/features/spaces/infrastructure/spaces-http-repository";

export default function AppLayoutRoute() {
  const sessionFallback = (
    <AppShellLayout
      authRepository={authClient}
      showRouteContent={false}
      showSpaceSwitcher={false}
    />
  );

  return (
    <AuthenticatedRoute
      client={authClient}
      errorFallback={sessionFallback}
      pendingFallback={sessionFallback}
    >
      <ActiveSpaceProvider repository={spacesHttpRepository}>
        <AppShellLayout authRepository={authClient} />
      </ActiveSpaceProvider>
    </AuthenticatedRoute>
  );
}
