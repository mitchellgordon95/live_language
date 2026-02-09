import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Game engine runs server-side only; externalize Node.js-specific packages
  serverExternalPackages: ['@anthropic-ai/sdk'],
  devIndicators: false,
};

export default nextConfig;
