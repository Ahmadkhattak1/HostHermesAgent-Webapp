import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";

const appRoot = fileURLToPath(new URL(".", import.meta.url));
const firebaseProjectAuthHost =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "hosthermesagent.firebaseapp.com";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_DIST_DIR
    ? {
        distDir: process.env.NEXT_DIST_DIR,
      }
    : {}),
  async rewrites() {
    return [
      {
        // Proxy Firebase's hosted auth helpers through the app origin for redirect-based sign-in.
        source: "/__/auth/:path*",
        destination: `https://${firebaseProjectAuthHost}/__/auth/:path*`,
      },
      {
        // Keep Firebase init metadata on the same origin when using a reverse proxy in dev.
        source: "/__/firebase/:path*",
        destination: `https://${firebaseProjectAuthHost}/__/firebase/:path*`,
      },
    ];
  },
  turbopack: {
    root: appRoot,
  },
};

export default nextConfig;
