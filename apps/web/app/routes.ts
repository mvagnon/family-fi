import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("preview/family", "routes/preview/family.tsx"),
] satisfies RouteConfig;
