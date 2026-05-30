import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/app-layout.tsx", [
    route("configuration", "routes/configuration.tsx"),
    route("family", "routes/family.tsx"),
  ]),
] satisfies RouteConfig;
