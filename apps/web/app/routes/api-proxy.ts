import { proxyApiRequest } from "~/infrastructure/api-proxy.server";

import type { Route } from "./+types/api-proxy";

export function loader({ request }: Route.LoaderArgs) {
  return proxyApiRequest({
    request,
    upstreamOrigin: getFamilyFiApiUpstreamOrigin(),
  });
}

export function action({ request }: Route.ActionArgs) {
  return proxyApiRequest({
    request,
    upstreamOrigin: getFamilyFiApiUpstreamOrigin(),
  });
}

function getFamilyFiApiUpstreamOrigin(): string {
  return (
    process.env.FAMILY_FI_API_UPSTREAM_ORIGIN ??
    process.env.VITE_API_BASE_URL ??
    "http://localhost:3001"
  );
}
