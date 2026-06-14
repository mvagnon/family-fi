import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/*", "routes/api-proxy.ts"),
  route("auth/signed-out", "routes/auth-signed-out.tsx"),
  layout("routes/app-layout.tsx", [
    route("configuration", "routes/configuration.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("distribution", "routes/distribution.tsx"),
    route("family", "routes/family.tsx"),
    route("loans", "routes/loans.tsx"),
    route("participations", "routes/participations.tsx"),
  ]),
] satisfies RouteConfig;
