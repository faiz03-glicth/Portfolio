import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Emits a self-contained server bundle in .next/standalone.
  // This is what gets rsynced to the Hostinger VPS and run under PM2.
  output: "standalone",

  // Pin the trace root to this directory. Without it Next walks up looking for
  // lockfiles and can root the trace above the project, which produces a
  // standalone bundle with the wrong relative paths once it is on the server.
  outputFileTracingRoot: projectRoot,

  images: {
    // Remote hosts are added per integration as those branches land
    // (Spotify album art, GitHub/GitLab avatars).
    remotePatterns: [],
  },

  eslint: {
    // Linting runs as its own CI stage; keep `next build` focused on compiling.
    ignoreDuringBuilds: true,
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
