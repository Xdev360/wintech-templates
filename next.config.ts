import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No Next.js badge or "compiling" toast over the design while developing.
  // Errors are still reported in the terminal.
  devIndicators: false,
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
