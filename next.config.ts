import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@anthropic-ai/sdk', 'pg'],
  devIndicators: false,
};

export default nextConfig;
