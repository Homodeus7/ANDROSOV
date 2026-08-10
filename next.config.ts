import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: import.meta.dirname },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
};

export default createNextIntlPlugin("./src/shared/i18n/request.ts")(nextConfig);
