import { authClient } from "~/features/auth/infrastructure/auth-client";
import { HomeRedirect } from "~/features/auth/presentation/auth-route-gates";

export default function Home() {
  return <HomeRedirect client={authClient} />;
}
