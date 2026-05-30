import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("configuration", "routes/configuration.tsx"),
  route("family", "routes/family.tsx"),
] satisfies RouteConfig;
