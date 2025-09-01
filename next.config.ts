import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js設定 - 不要な設定を削除
  
  // Disable external optimizations in CI environment for firewall restrictions
  ...(process.env.CI && {
    // Disable font optimization to prevent external calls
    experimental: {
      optimizePackageImports: [],
    },
  }),
};

export default nextConfig;
