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

// Baseline hardening for every response. No full Content-Security-Policy yet
// (Next's inline scripts would need nonces, which needs its own testing
// pass) — only `frame-ancestors`, which restricts framing and nothing else.
const SECURITY_HEADERS = [
  // Nobody may embed the site in a frame (clickjacking on the cart/order forms).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Browsers must trust the declared Content-Type, never guess one.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Other sites see only the origin, not full URLs (search terms, promo pages…).
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The site uses none of these APIs (the receipt "photo" is a file input).
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  // Receipt photos are shrunk in the browser first (lib/compress-image.ts);
  // this is the safety net when that isn't possible. Matches the 5 MB cap
  // in lib/storage.ts, plus room for the form encoding.
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: [
      // Real product photos and payment receipts, uploaded to Cloudflare
      // R2 — see lib/storage.ts and the R2 setup steps in the README.
      ...r2RemotePattern(),
    ],
  },
};

export default nextConfig;
