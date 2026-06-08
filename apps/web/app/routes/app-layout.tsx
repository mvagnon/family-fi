import { authClient } from "~/features/auth/infrastructure/auth-client";
import { AuthenticatedRoute } from "~/features/auth/presentation/auth-route-gates";
import { AppShellLayout } from "~/features/app-shell/presentation/app-shell-layout";
import { FamilyMemberVisibilityProvider } from "~/features/family/presentation/family-member-visibility-provider";
import { ActiveSpaceProvider } from "~/features/spaces/presentation/active-space-provider";
import { spacesHttpRepository } from "~/features/spaces/infrastructure/spaces-http-repository";
import { getConfiguredLoginFallbackUrl } from "~/infrastructure/runtime-config";

export default function AppLayoutRoute() {
  const loginFallbackUrl = getConfiguredLoginFallbackUrl();
  const sessionFallback = (
    <AppShellLayout
      authRepository={authClient}
      loginFallbackUrl={loginFallbackUrl}
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
        <FamilyMemberVisibilityProvider>
          <AppShellLayout
            authRepository={authClient}
            loginFallbackUrl={loginFallbackUrl}
          />
        </FamilyMemberVisibilityProvider>
      </ActiveSpaceProvider>
    </AuthenticatedRoute>
  );
}
