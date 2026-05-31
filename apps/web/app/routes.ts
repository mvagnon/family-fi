import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  layout("routes/app-layout.tsx", [
    route("configuration", "routes/configuration.tsx"),
    route("dashboard", "routes/dashboard.tsx"),
    route("family", "routes/family.tsx"),
  ]),
] satisfies RouteConfig;
