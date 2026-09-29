// One place for the shop's identity: name, city, WhatsApp, public URL.
// Before this, the WhatsApp link was typed by hand in 13 files.

export const SHOP = {
  name: "Electro Zaki",
  city: "Meknès",
  country: "MA",
  tagline: "Téléphones & accessoires à Meknès",
  whatsappNumber: "212667654430",
  whatsappDisplay: "+212 6 67 65 44 30",
} as const;

export const WHATSAPP_URL = `https://wa.me/${SHOP.whatsappNumber}`;

/** WhatsApp link with a pre-written message (e.g. about one product). */
export function whatsappLink(text?: string): string {
  return text ? `${WHATSAPP_URL}?text=${encodeURIComponent(text)}` : WHATSAPP_URL;
}

// Absolute URL of the public site, needed for canonical links, the
// sitemap, Open Graph and structured data. Set NEXT_PUBLIC_SITE_URL in
// production (e.g. https://www.electrozaki.ma); Vercel's own production
// hostname is used when it isn't set.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
