import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: ".",
  // Remove turbopack config for production builds
  // turbopack is only used in development
};

export default nextConfig;
