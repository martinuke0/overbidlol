import type { NextConfig } from "next";

const config: NextConfig = {
  // Google favicon service for row avatars
  images: { remotePatterns: [{ protocol: "https", hostname: "www.google.com" }] },
};

export default config;
