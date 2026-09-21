import type { NextConfig } from "next";

// R2_PUBLIC_URL is either the bucket's default `pub-<hash>.r2.dev` URL or a
// custom domain connected to it in the Cloudflare dashboard — read at build
// time so this doesn't need editing when that changes. Falls back to no
// pattern (rather than throwing) so the app still builds before the env
// var is filled in during initial setup.
function r2RemotePattern(): { protocol: "https"; hostname: string }[] {
  if (!process.env.R2_PUBLIC_URL) return [];
  try {
    const { hostname } = new URL(process.env.R2_PUBLIC_URL);
    return [{ protocol: "https", hostname }];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Seed/demo images only — safe to remove once real product photos
      // replace them.
      { protocol: "https", hostname: "placehold.co" },
      // Real product photos and payment receipts, uploaded to Cloudflare
      // R2 — see lib/storage.ts and the R2 setup steps in the README.
      ...r2RemotePattern(),
    ],
  },
};

export default nextConfig;
