import { LoginPage } from "~/features/auth/presentation/login-page";
import { PublicOnlyRoute } from "~/features/auth/presentation/auth-route-gates";
import { authClient } from "~/features/auth/infrastructure/auth-client";
import i18n from "~/i18n";

import type { Route } from "./+types/login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: i18n.t("auth.meta.loginTitle") },
    {
      name: "description",
      content: i18n.t("auth.meta.loginDescription"),
    },
  ];
}

export default function LoginRoute() {
  return (
    <PublicOnlyRoute client={authClient}>
      <LoginPage client={authClient} />
    </PublicOnlyRoute>
  );
}
