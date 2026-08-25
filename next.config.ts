import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all network dev origins (phones, tablets, local IP access)
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "172.26.96.1",
    "*.local",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*"
  ],
};

export default nextConfig;
