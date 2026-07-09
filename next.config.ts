import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["corvexbyte-siakad.netlify.app", "*.netlify.app"],
    },
  }

};

export default nextConfig;
