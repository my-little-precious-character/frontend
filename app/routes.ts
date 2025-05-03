import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("generate", "routes/generate.tsx"),
  route("rig", "routes/rig.tsx"),
  route("preview", "routes/preview.tsx"),
] satisfies RouteConfig;
