import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const workspaceRoot = fileURLToPath(new URL("..", import.meta.url));
const controlPlaneOrigin =
  process.env.CONTROL_PLANE_URL ??
  process.env.NEXT_PUBLIC_CONTROL_PLANE_URL ??
  "http://localhost:4000";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR
    ? {
        distDir: process.env.NEXT_DIST_DIR,
      }
    : {}),
  outputFileTracingRoot: workspaceRoot,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${controlPlaneOrigin}/api/:path*`,
      },
      {
        source: "/health",
        destination: `${controlPlaneOrigin}/health`,
      },
      {
        source: "/ws/:path*",
        destination: `${controlPlaneOrigin}/ws/:path*`,
      },
    ];
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
