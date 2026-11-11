import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    "@mealhrs/contracts",
    "@mealhrs/domain",
    "@mealhrs/mocks",
    "@mealhrs/ui",
  ],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
