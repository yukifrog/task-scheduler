import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // テスト環境でNext.js Dev Toolsを無効化
  devIndicators: {
    buildActivity: false,
  },
  experimental: {
    devToolsButton: false,
  },
};

export default nextConfig;
