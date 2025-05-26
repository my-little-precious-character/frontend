import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("generate", "routes/generate.tsx"),
  route("rig", "routes/rig.tsx"),
  route("preview", "routes/preview.tsx"),

  route("test-preview", "routes/test-preview.tsx"),  // FIXME: Remove this after testing
] satisfies RouteConfig;
