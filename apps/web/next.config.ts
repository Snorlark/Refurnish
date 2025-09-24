import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly disable turbopack for production builds
  experimental: {
    // No experimental features that might conflict with Vercel
  },
  // Let Vercel handle all build optimizations
  swcMinify: true,
};

export default nextConfig;
