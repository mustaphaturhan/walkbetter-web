import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // todo: remove this after development process is done
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
