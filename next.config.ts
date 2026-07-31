import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL || "https://shiny-wolverine-92.convex.site"}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
