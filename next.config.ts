import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['immense-clam-centrally.ngrok-free.app'],
  reactCompiler: true,
  experimental: {
    turbopackRustReactCompiler: true,
  },
};

export default nextConfig;
