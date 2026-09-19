import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seed/demo images only — safe to remove once real product photos
      // replace them.
      { protocol: "https", hostname: "placehold.co" },
      // Real product photos, once you're uploading them — same storage
      // already used for payment receipts, so no new service to set up.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
